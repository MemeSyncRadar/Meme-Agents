import math
from typing import List, Dict, Any

def compute_shannon_entropy(addresses: List[str]) -> float:
    """
    Compute Shannon entropy (bits) of an address sequence.
    """
    if not addresses:
        return 0.0
    freq: Dict[str, int] = {}
    for a in addresses:
        freq[a] = freq.get(a, 0) + 1
    total = len(addresses)
    entropy = 0.0
    for count in freq.values():
        p = count / total
        entropy -= p * math.log2(p)
    return round(entropy, 4)


def entropy_distribution(addresses: List[str]) -> Dict[str, Any]:
    """
    Return frequency and probability distribution of addresses.
    """
    freq: Dict[str, int] = {}
    for a in addresses:
        freq[a] = freq.get(a, 0) + 1
    total = len(addresses) or 1
    distribution = {a: round(count / total, 4) for a, count in freq.items()}
    return {"total": total, "distribution": distribution}


def normalized_entropy(addresses: List[str]) -> float:
    """
    Compute normalized entropy [0.0–1.0] where 1.0 means maximum diversity.
    """
    if not addresses:
        return 0.0
    entropy = compute_shannon_entropy(addresses)
    max_entropy = math.log2(len(set(addresses))) if addresses else 1
    return round(entropy / max_entropy, 4) if max_entropy > 0 else 0.0
