import React from "react"

interface MarketSentimentWidgetProps {
  sentimentScore: number // value from 0 to 100
  trend: "Bullish" | "Bearish" | "Neutral"
  dominantToken: string
  totalVolume24h: number
  updatedAt?: number
}

const getSentimentColor = (score: number) => {
  if (score >= 70) return "#4caf50"
  if (score >= 40) return "#ff9800"
  return "#f44336"
}

const formatDate = (timestamp?: number) => {
  if (!timestamp) return "N/A"
  return new Date(timestamp).toLocaleString()
}

export const MarketSentimentWidget: React.FC<MarketSentimentWidgetProps> = ({
  sentimentScore,
  trend,
  dominantToken,
  totalVolume24h,
  updatedAt,
}) => {
  return (
    <div className="market-sentiment-widget p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-3">Market Sentiment</h3>
      <div className="sentiment-info flex items-center gap-4">
        <div
          className="score-circle flex items-center justify-center rounded-full text-white font-bold w-16 h-16"
          style={{
            backgroundColor: getSentimentColor(sentimentScore),
          }}
        >
          {sentimentScore}%
        </div>
        <ul className="sentiment-details text-sm space-y-1">
          <li>
            <strong>Trend:</strong> {trend}
          </li>
          <li>
            <strong>Dominant Token:</strong> {dominantToken}
          </li>
          <li>
            <strong>24h Volume:</strong> ${totalVolume24h.toLocaleString()}
          </li>
          <li>
            <strong>Updated:</strong> {formatDate(updatedAt)}
          </li>
        </ul>
      </div>
    </div>
  )
}

export default MarketSentimentWidget
