import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
// @ts-ignore
import ForceGraph2D from 'force-graph'
import { apiClient } from '../api'

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
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEmpty, setIsEmpty] = useState(false)

  useEffect(() => {
    const fetchAndRender = async () => {
      try {
        const res = await apiClient.get<{
          graph: { nodes: SkillNode[]; edges: SkillEdge[] }
        }>('/v1/skills/prerequisite-graph')

        const { nodes, edges } = res.graph

        if (nodes.length === 0) {
          setIsEmpty(true)
          return
        }

        if (!containerRef.current) return

        const graphData = {
          nodes: nodes.map(n => ({ id: n.id, name: n.name, slug: n.slug })),
          links: edges.map(e => ({
            source: e.fromId,
            target: e.toId,
            type: e.type,
          })),
        }

        const width = containerRef.current.clientWidth || 800
        const height = 500

        const Graph = new (ForceGraph2D as any)()(containerRef.current)
          .width(width)
          .height(height)
          .graphData(graphData)
          .nodeLabel('name')
          .nodeColor(() => '#6C63FF')
          .nodeRelSize(8)
          .linkColor((link: any) =>
            link.type === 'NEXT_STEP' ? '#6C63FF' : '#00D2FF'
          )
          .linkWidth(2)
          .linkDirectionalArrowLength(6)
          .linkDirectionalArrowRelPos(1)
          .nodeCanvasObject((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const label = node.name
            const fontSize = 12 / globalScale
            ctx.font = `${fontSize}px Sans-Serif`
            const textWidth = ctx.measureText(label).width
            const bckgDimensions = [textWidth + 8, fontSize + 6]

            ctx.fillStyle = '#6C63FF'
            ctx.beginPath()
            ctx.roundRect(
              node.x - bckgDimensions[0] / 2,
              node.y - bckgDimensions[1] / 2,
              bckgDimensions[0],
              bckgDimensions[1],
              4
            )
            ctx.fill()

            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = 'white'
            ctx.fillText(label, node.x, node.y)

            node.__bckgDimensions = bckgDimensions
          })
          .nodePointerAreaPaint((node: any, color: string, ctx: CanvasRenderingContext2D) => {
            ctx.fillStyle = color
            const bckgDimensions = node.__bckgDimensions
            if (bckgDimensions) {
              ctx.fillRect(
                node.x - bckgDimensions[0] / 2,
                node.y - bckgDimensions[1] / 2,
                bckgDimensions[0],
                bckgDimensions[1]
              )
            }
          })

        return () => Graph._destructor?.()
      } catch {
        setError('Nie udało się pobrać drzewa umiejętności.')
      } finally {
        setLoading(false)
      }
    }

    fetchAndRender()
  }, [])

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Drzewo umiejętności
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Odkryj i rozwijaj swoje umiejętności
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {isEmpty && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Brak umiejętności do wyświetlenia
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Administrator musi dodać umiejętności do systemu
          </Typography>
        </Paper>
      )}

      <Paper sx={{ p: 2, display: loading || isEmpty ? 'none' : 'block' }}>
        <Box ref={containerRef} sx={{ width: '100%', height: 500 }} />
        <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Chip size="small" label="Następny krok" sx={{ bgcolor: '#6C63FF20', color: '#6C63FF', border: '1px solid #6C63FF' }} />
          <Chip size="small" label="Podumiejętność" sx={{ bgcolor: '#00D2FF20', color: '#00A8CC', border: '1px solid #00D2FF' }} />
        </Box>
      </Paper>
    </>
  )
}