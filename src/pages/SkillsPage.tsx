import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import { getSkillsGraph } from '../api'

interface SkillNode {
  id: string
  name: string
  slug: string
}

interface SkillEdge {
  fromId: string
  toId: string
  type: string
}

export default function SkillsPage() {
  const [nodes, setNodes] = useState<SkillNode[]>([])
  const [edges, setEdges] = useState<SkillEdge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSkillsGraph()
        setNodes(res.graph.nodes)
        setEdges(res.graph.edges)
      } catch {
        setError('Nie udało się pobrać drzewa umiejętności.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  // Oblicz pozycje węzłów w układzie drzewa
  const nodePositions = new Map<string, { x: number; y: number }>()
  const levels = new Map<string, number>()

  // Znajdź węzły bez rodziców (korzenie)
  const hasParent = new Set(edges.map(e => e.toId))
  const roots = nodes.filter(n => !hasParent.has(n.id))

  const assignLevel = (nodeId: string, level: number) => {
    if (!levels.has(nodeId) || levels.get(nodeId)! < level) {
      levels.set(nodeId, level)
    }
    edges.filter(e => e.fromId === nodeId).forEach(e => assignLevel(e.toId, level + 1))
  }

  roots.forEach(r => assignLevel(r.id, 0))
  nodes.forEach(n => { if (!levels.has(n.id)) levels.set(n.id, 0) })

  const nodesByLevel = new Map<number, string[]>()
  levels.forEach((level, nodeId) => {
    if (!nodesByLevel.has(level)) nodesByLevel.set(level, [])
    nodesByLevel.get(level)!.push(nodeId)
  })

  const NODE_W = 140
  const NODE_H = 50
  const H_GAP = 40
  const V_GAP = 80

  nodesByLevel.forEach((nodeIds, level) => {
    const totalW = nodeIds.length * NODE_W + (nodeIds.length - 1) * H_GAP
    const startX = -totalW / 2
    nodeIds.forEach((nodeId, i) => {
      nodePositions.set(nodeId, {
        x: startX + i * (NODE_W + H_GAP),
        y: level * (NODE_H + V_GAP),
      })
    })
  })

  const maxLevel = Math.max(0, ...Array.from(levels.values()))
  const svgH = (maxLevel + 1) * (NODE_H + V_GAP) + 40
  const allX = Array.from(nodePositions.values()).map(p => p.x)
  const minX = Math.min(0, ...allX)
  const maxX = Math.max(0, ...allX)
  const svgW = Math.max(600, maxX - minX + NODE_W + 80)
  const offsetX = -minX + 40

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Drzewo umiejętności
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Odkryj i rozwijaj swoje umiejętności
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : nodes.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Brak umiejętności do wyświetlenia
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Administrator musi dodać umiejętności do systemu
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ p: 2, overflow: 'auto' }}>
          <svg width={svgW} height={svgH} style={{ display: 'block', margin: '0 auto' }}>
            {/* Linie połączeń */}
            {edges.map((edge, i) => {
              const from = nodePositions.get(edge.fromId)
              const to = nodePositions.get(edge.toId)
              if (!from || !to) return null
              const x1 = from.x + offsetX + NODE_W / 2
              const y1 = from.y + NODE_H
              const x2 = to.x + offsetX + NODE_W / 2
              const y2 = to.y
              const midY = (y1 + y2) / 2
              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} C ${x1} ${midY} ${x2} ${midY} ${x2} ${y2}`}
                  fill="none"
                  stroke={edge.type === 'NEXT_STEP' ? '#6C63FF' : '#00D2FF'}
                  strokeWidth={2}
                  strokeDasharray={edge.type === 'NEXT_STEP' ? 'none' : '6,3'}
                  opacity={0.7}
                />
              )
            })}

            {/* Węzły */}
            {nodes.map(node => {
              const pos = nodePositions.get(node.id)
              if (!pos) return null
              const x = pos.x + offsetX
              const y = pos.y
              const isRoot = !hasParent.has(node.id)
              return (
                <g key={node.id}>
                  <rect
                    x={x}
                    y={y}
                    width={NODE_W}
                    height={NODE_H}
                    rx={10}
                    fill={isRoot ? 'url(#rootGrad)' : 'url(#nodeGrad)'}
                    stroke={isRoot ? '#6C63FF' : '#9590FF'}
                    strokeWidth={2}
                    style={{ cursor: 'pointer', filter: 'drop-shadow(0 2px 8px rgba(108,99,255,0.2))' }}
                  />
                  <text
                    x={x + NODE_W / 2}
                    y={y + NODE_H / 2 + 5}
                    textAnchor="middle"
                    fill="white"
                    fontSize={12}
                    fontWeight={600}
                    fontFamily="sans-serif"
                  >
                    {node.name.length > 16 ? node.name.slice(0, 14) + '…' : node.name}
                  </text>
                </g>
              )
            })}

            <defs>
              <linearGradient id="rootGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6C63FF" />
                <stop offset="100%" stopColor="#00D2FF" />
              </linearGradient>
              <linearGradient id="nodeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#9590FF" />
                <stop offset="100%" stopColor="#6C63FF" />
              </linearGradient>
            </defs>
          </svg>

          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Chip size="small" label="Następny krok" sx={{ bgcolor: '#6C63FF20', color: '#6C63FF', border: '1px solid #6C63FF' }} />
            <Chip size="small" label="Podumiejętność" sx={{ bgcolor: '#00D2FF20', color: '#00A8CC', border: '1px solid #00D2FF', '& .MuiChip-label': { borderBottom: '2px dashed #00D2FF' } }} />
          </Box>
        </Paper>
      )}
    </>
  )
}