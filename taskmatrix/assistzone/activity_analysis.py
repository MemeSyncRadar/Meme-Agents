from typing import List, Tuple, Dict

def generate_activity_heatmap(
    timestamps: List[int],
    counts: List[int],
    buckets: int = 10,
    normalize: bool = True
) -> List[float]:
    """
    Bucket activity counts into 'buckets' time intervals,
    returning either raw counts or normalized [0.0–1.0].
    - timestamps: list of epoch ms timestamps.
    - counts: list of integer counts per timestamp.
    """
    if not timestamps:
        return []

    t_min, t_max = min(timestamps), max(timestamps)
    span = t_max - t_min or 1
    bucket_size = span / buckets

    agg = [0] * buckets
    for t, c in zip(timestamps, counts):
        idx = min(buckets - 1, int((t - t_min) / bucket_size))
        agg[idx] += c

    if normalize:
        m = max(agg) or 1
        return [round(val / m, 4) for val in agg]
    return agg


def heatmap_with_labels(
    timestamps: List[int],
    counts: List[int],
    buckets: int = 10
) -> List[Tuple[Tuple[int, int], int]]:
    """
    Return heatmap as a list of tuples with bucket ranges and counts.
    Each entry: ((start_time, end_time), count).
    """
    if not timestamps:
        return []

    t_min, t_max = min(timestamps), max(timestamps)
    span = t_max - t_min or 1
    bucket_size = span / buckets

    agg = [0] * buckets
    for t, c in zip(timestamps, counts):
        idx = min(buckets - 1, int((t - t_min) / bucket_size))
        agg[idx] += c

    results: List[Tuple[Tuple[int, int], int]] = []
    for i, val in enumerate(agg):
        start = int(t_min + i * bucket_size)
        end = int(t_min + (i + 1) * bucket_size)
        results.append(((start, end), val))
    return results


def summarize_heatmap(values: List[float]) -> Dict[str, float]:
    """
    Provide simple statistics on a heatmap array.
    Returns min, max, and average intensity.
    """
    if not values:
        return {"min": 0.0, "max": 0.0, "avg": 0.0}
    return {
        "min": float(min(values)),
        "max": float(max(values)),
        "avg": round(sum(values) / len(values), 4),
    }
