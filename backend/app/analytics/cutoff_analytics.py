import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from app.models import Cutoff, ExamCycle, Exam

def get_cutoff_analytics(
    db: Session,
    exam_slug: str | None = None,
    phase: str | None = None,
    category: str | None = "UR",
    section: str | None = None
):
    query = db.query(Cutoff, ExamCycle, Exam).join(ExamCycle, Cutoff.exam_cycle_id == ExamCycle.id).join(Exam, ExamCycle.exam_id == Exam.id)

    if exam_slug:
        query = query.filter(Exam.slug == exam_slug)
    if phase:
        query = query.filter(Cutoff.phase == phase)
    if category:
        query = query.filter(Cutoff.category == category)
    if section:
        query = query.filter(Cutoff.section == section)

    records = query.all()
    if not records:
        return {
            "trend": [],
            "sectional_breakdown": [],
            "overall_vs_sectional": [],
            "movement_stats": {
                "latest_year": None,
                "latest_cutoff": None,
                "movement_3_year": 0.0,
                "pct_change_3_year": 0.0,
                "min_cutoff": None,
                "max_cutoff": None,
                "avg_cutoff": None
            }
        }

    data = []
    for cut, cycle, exam in records:
        data.append({
            "exam_slug": str(exam.slug),
            "exam_name": str(exam.name),
            "year": int(cycle.year),
            "phase": str(cut.phase),
            "category": str(cut.category),
            "section": str(cut.section),
            "cutoff": float(cut.cutoff),
            "maximum_marks": float(cut.maximum_marks)
        })

    df = pd.DataFrame(data)

    # 1. Historical Cutoff Trend
    overall_df = df[df["section"] == "Overall"] if "Overall" in df["section"].values else df
    trend_df = overall_df.groupby("year")["cutoff"].mean().reset_index().sort_values("year")
    trend = [{"year": int(r["year"]), "cutoff": round(float(r["cutoff"]), 2)} for _, r in trend_df.iterrows()]

    # 2. Sectional Breakdown grouped by year and section
    sect_df = df[df["section"] != "Overall"]
    sectional_breakdown = []
    if not sect_df.empty:
        sect_pivot = sect_df.groupby(["year", "section"])["cutoff"].mean().unstack(fill_value=0).reset_index()
        for _, row in sect_pivot.iterrows():
            r_dict = {"year": int(row["year"])}
            for col in sect_pivot.columns:
                if col != "year":
                    r_dict[str(col)] = round(float(row[col]), 2)
            sectional_breakdown.append(r_dict)

    # 3. Overall vs Sectional comparison
    ov_vs_sec = []
    for _, r in df.groupby(["year", "section"])["cutoff"].mean().reset_index().iterrows():
        ov_vs_sec.append({
            "year": int(r["year"]),
            "section": str(r["section"]),
            "cutoff": round(float(r["cutoff"]), 2)
        })

    # 4. Movement Statistics Calculation
    movement_stats = {
        "latest_year": None,
        "latest_cutoff": None,
        "movement_3_year": 0.0,
        "pct_change_3_year": 0.0,
        "min_cutoff": round(float(df["cutoff"].min()), 2) if not df.empty else 0.0,
        "max_cutoff": round(float(df["cutoff"].max()), 2) if not df.empty else 0.0,
        "avg_cutoff": round(float(df["cutoff"].mean()), 2) if not df.empty else 0.0,
    }

    if not trend_df.empty:
        sorted_years = trend_df.sort_values("year", ascending=True)
        latest_row = sorted_years.iloc[-1]
        movement_stats["latest_year"] = int(latest_row["year"])
        movement_stats["latest_cutoff"] = round(float(latest_row["cutoff"]), 2)

        if len(sorted_years) >= 2:
            base_row = sorted_years.iloc[-3] if len(sorted_years) >= 3 else sorted_years.iloc[0]
            move = float(latest_row["cutoff"] - base_row["cutoff"])
            pct = round(float((move / base_row["cutoff"] * 100)), 2) if base_row["cutoff"] > 0 else 0.0
            movement_stats["movement_3_year"] = round(move, 2)
            movement_stats["pct_change_3_year"] = pct

    return {
        "trend": trend,
        "sectional_breakdown": sectional_breakdown,
        "overall_vs_sectional": ov_vs_sec,
        "movement_stats": movement_stats
    }
