import os
from typing import Any


def _normalise(text: str) -> str:
    return " ".join(text.lower().split())


def _matches(message: str, *keywords: str) -> bool:
    normalised = _normalise(message)
    return any(keyword in normalised for keyword in keywords)


def _build_fallback_response(message: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
    cleaned = (message or "").strip()
    page = (context or {}).get("page") or "general"
    filters = (context or {}).get("filters") or {}
    selected_area = (context or {}).get("selectedArea")
    selected_incident = (context or {}).get("selectedIncident")

    if not cleaned:
        cleaned = "How do I use CrimeVista?"

    knowledge = {
        "overview": "The dashboard summarises the current filtered crime dataset, including KPIs, incident trends, and the highest-risk areas. Use the filter panel to narrow by date, crime type, area, severity, or time period.",
        "map": "The Crime Map plots geocoded incidents with filters applied. A cluster toggle helps you group nearby points, while the detail panel shows the incident context and severity for a selected record.",
        "hotspots": "Hotspots rank areas by incident concentration and density. Watch the top-ranked locations, high-severity counts, and dominant crime type to spot where intervention is most urgent.",
        "areas": "Area Explorer compares one area against the citywide pattern, showing the area's contribution, dominant crime types, and temporal change. It helps explain whether a local spike is unusual or part of a broader trend.",
        "upload": "Data Upload accepts CSV files with the required incident columns. The backend validates the file, updates the active dataset, and reports rows imported, rejected, and areas detected.",
        "reports": "Reports let you generate export-ready summaries for a selected period, section set, and filters. They are useful for briefing teams and preserving audit-ready snapshots.",
        "risk": "Risk levels summarise where the concentration and severity of incidents are highest. Treat the top hotspots as priority areas for deeper review, patrol, or investigation planning.",
        "severity": "Severity reflects how serious or impactful an incident is. Critical and high-severity incidents usually warrant faster attention, while low-severity incidents may still matter when clustered in a small area.",
        "filters": "Filters help narrow the active dataset to a relevant period, area, crime category, severity, or time-of-day slice. Resetting filters restores the full citywide view.",
        "faq": "CrimeVista is built for city-scale crime intelligence and works from the active dataset loaded into the app. When no external AI provider is configured, the assistant answers from the app's built-in crime intelligence guidance and still helps with navigation, filters, and KPIs.",
    }

    answer = knowledge.get(page, knowledge["faq"]) if page in knowledge else knowledge["faq"]

    if _matches(cleaned, "dashboard", "overview", "kpi", "executive"):
        answer = "The executive overview combines total incident volume, key trend indicators, and distribution charts. It is designed to show whether the citywide picture is stable, rising, or concentrated in a few hotspots."
    elif _matches(cleaned, "map", "incident", "location", "geo"):
        answer = knowledge["map"]
    elif _matches(cleaned, "hotspot", "risk", "danger", "priority"):
        answer = knowledge["hotspots"]
    elif _matches(cleaned, "area", "area explorer", "comparison"):
        answer = knowledge["areas"]
    elif _matches(cleaned, "upload", "dataset", "csv", "import"):
        answer = knowledge["upload"]
    elif _matches(cleaned, "report", "export", "pdf", "csv", "xlsx"):
        answer = knowledge["reports"]
    elif _matches(cleaned, "severity", "critical", "high", "low"):
        answer = knowledge["severity"]
    elif _matches(cleaned, "filter", "date", "crime type", "time period"):
        answer = knowledge["filters"]
    elif _matches(cleaned, "how", "use", "start", "help", "guide"):
        answer = "Start with the dashboard for the citywide picture, then move to the map or hotspots page to drill into locations. Use filters to narrow the data and the Help page for the full walkthrough of each feature."

    if selected_area:
        answer += f" You are currently looking at the area '{selected_area}'."
    if selected_incident:
        answer += " The selected incident context is available if you want a deeper breakdown of that record."
    if filters:
        answer += " The active filters are currently narrowing the dataset to a more specific scope."

    suggested_actions = []
    if page == "dashboard":
        suggested_actions = ["Review the KPI cards", "Inspect monthly trend", "Open the hotspot ranking"]
    elif page == "map":
        suggested_actions = ["Toggle nearby clustering", "Select a marked incident", "Check missing-location alerts"]
    elif page == "hotspots":
        suggested_actions = ["Review top risk areas", "Open area explorer", "Check severity split"]
    elif page == "upload":
        suggested_actions = ["Prepare the CSV", "Validate required columns", "Review upload status"]
    elif page == "reports":
        suggested_actions = ["Create a report", "Select key sections", "Download the output"]
    else:
        suggested_actions = ["Open the Help page", "Review the dashboard", "Inspect hotspots"]

    return {
        "answer": answer,
        "provider": "fallback",
        "context": {
            "page": page,
            "selectedArea": selected_area,
            "selectedIncident": bool(selected_incident),
            "activeFilters": bool(filters),
        },
        "suggestedActions": suggested_actions,
    }


async def generate_chat_response(payload: dict[str, Any]) -> dict[str, Any]:
    message = str((payload or {}).get("message") or "").strip()
    context = {
        "page": (payload or {}).get("page"),
        "filters": (payload or {}).get("filters") or {},
        "selectedArea": (payload or {}).get("selectedArea"),
        "selectedIncident": (payload or {}).get("selectedIncident"),
    }

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if api_key:
        try:
            from openai import OpenAI

            client = OpenAI(api_key=api_key)
            completion = client.chat.completions.create(
                model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are CrimeVista AI, a city crime intelligence assistant for global safety analytics. "
                            "Answer concisely using the app's existing metrics, filters, hotspots, trend analysis, "
                            "and reporting concepts. If the user asks about configuration or features that the app does not support, "
                            "explain the built-in CrimeVista workflow instead."
                        ),
                    },
                    {"role": "user", "content": message},
                ],
                temperature=0.2,
            )
            content = completion.choices[0].message.content.strip()
            if content:
                return {
                    "answer": content,
                    "provider": "openai",
                    "context": {
                        "page": context["page"],
                        "selectedArea": context["selectedArea"],
                        "selectedIncident": bool(context["selectedIncident"]),
                        "activeFilters": bool(context["filters"]),
                    },
                    "suggestedActions": ["Review the dashboard", "Inspect hotspots", "Open the Help guide"],
                }
        except Exception:
            pass

    return _build_fallback_response(message, context)
