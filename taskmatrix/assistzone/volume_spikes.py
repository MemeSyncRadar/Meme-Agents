from typing import List, Dict, Any

def detect_volume_bursts(
    volumes: List[float],
    threshold_ratio: float = 1.5,
    min_interval: int = 1
) -> List[Dict[str, Any]]:
    """
    Identify indices where volume jumps by threshold_ratio over previous.
    Returns list of dicts: {index, previous, current, ratio}.
    """
    events: List[Dict[str, Any]] = []
    last_idx = -min_interval
    for i in range(1, len(volumes)):
        prev, curr = volumes[i - 1], volumes[i]
        ratio = (curr / prev) if prev > 0 else float("inf")
        if ratio >= threshold_ratio and (i - last_idx) >= min_interval:
            events.append({
                "index": i,
                "previous": prev,
                "current": curr,
                "ratio": round(ratio, 4),
            })
            last_idx = i
    return events


def burst_summary(events: List[Dict[str, Any]]) -> Dict[str, float]:
    """
    Summarize burst events with count, max ratio, and average ratio.
    """
    if not events:
        return {"count": 0, "max_ratio": 0.0, "avg_ratio": 0.0}
    ratios = [e["ratio"] for e in events]
    return {
        "count": len(events),
        "max_ratio": max(ratios),
        "avg_ratio": round(sum(ratios) / len(ratios), 4),
    }


def find_strongest_burst(events: List[Dict[str, Any]]) -> Dict[str, Any] | None:
    """
    Return the burst event with the highest ratio.
    """
    if not events:
        return None
    return max(events, key=lambda e: e["ratio"])
