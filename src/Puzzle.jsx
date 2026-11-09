import React, { useMemo } from 'react';
import usePuzzleLayout from './puzzle.js'

const DIRECTION_VECTORS = {
    0: { x: 0,  y: -1 },
    1: { x: 1,  y: -1 },
    2: { x: 1,  y: 0 },
    3: { x: 1,  y: 1 },
    4: { x: 0,  y: 1 },
    5: { x: -1, y: 1 },
    6: { x: -1, y: 0 },
    7: { x: -1, y: -1 }
};

export default function PuzzlePanel({ puzzle, playerPath = ['v0'] }) {
    const CELL_SIZE = 80;
    const PADDING = 40; // Gives breathing room for start/end caps

    // Stage 1 Calculation
    const { vertices, puzzleWidth, puzzleHeight } = useMemo(
        () => usePuzzleLayout(puzzle, CELL_SIZE),
        [puzzle]
    );

    // Compute overall dynamic canvas view parameters
    const viewWidth = puzzleWidth + PADDING * 2;
    const viewHeight = puzzleHeight + PADDING * 2;

    // Midpoint helper engine for line attributes and rules
    const getEdgePoints = (edge) => {
        const pA = vertices[edge.va];
        const pB = vertices[edge.vb];
        return {
            x1: pA.x + PADDING,
            y1: pA.y + PADDING,
            x2: pB.x + PADDING,
            y2: pB.y + PADDING,
            midX: (pA.x + pB.x) / 2 + PADDING,
            midY: (pA.y + pB.y) / 2 + PADDING
        };
    };

    // Centroid helper engine for puzzle square tiles
    const getFaceCentroid = (faceEdgeIds) => {
        let sumX = 0, sumY = 0, count = 0;
        const uniqueVertexIds = new Set();

        faceEdgeIds.forEach(eId => {
            const edge = puzzle.topology.edges[eId];
            uniqueVertexIds.add(edge.va);
            uniqueVertexIds.add(edge.vb);
        });

        uniqueVertexIds.forEach(vId => {
            sumX += vertices[vId].x;
            sumY += vertices[vId].y;
            count++;
        });

        return {
            x: sumX / count + PADDING,
            y: sumY / count + PADDING
        };
    };
    return (
        <div className="puzzle-container" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
            <svg
                viewBox={`0 0 ${viewWidth} ${viewHeight}`}
                style={{ width: '100%', height: 'auto', borderRadius: '12px' }}
            >
                <defs>
                    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
                        <stop offset="40%" stop-color="#000000" stop-opacity="0" />
                        <stop offset="100%" stop-color="#000000" stop-opacity="0.5" />
                    </radialGradient>
                </defs>
                <rect width="100%" height="100%" fill={puzzle.style.colors.bColor} />

                {/* LAYER 1: FACE TILES & BACKGROUND RECTANGLES */}
                {Object.entries(puzzle.topology.faces).map(([fId, faceEdges]) => {
                    const center = getFaceCentroid(faceEdges);
                    const clue = puzzle.elements.faces?.[fId]; // Assuming space for face clues

                    return (
                        <g key={fId}>
                            {/* Optional: Add custom SVG drawing routines here if rendering specific backgrounds */}
                            {clue?.type === 'COLOR_SQUARE' && (
                                <rect
                                    x={center.x - 10}
                                    y={center.y - 10}
                                    width={20}
                                    height={20}
                                    rx={4}
                                    fill={clue.color}
                                />
                            )}
                        </g>
                    );
                })}

                {/* LAYER 2: UNDERLYING BASE GRID PATHS */}
                {Object.entries(puzzle.topology.edges).map(([eId, edge]) => {
                    const { x1, y1, x2, y2 } = getEdgePoints(edge);
                    const element = puzzle.elements.edges?.[eId];

                    return (
                        <>
                            {element?.id !== "l_break" && (
                                <line
                                    key={eId}
                                    x1={x1} y1={y1} x2={x2} y2={y2}
                                    stroke={puzzle.style.colors.pColor}
                                    strokeWidth={16}
                                    strokeLinecap="round"
                                />
                            )}
                        </>
                    );
                })}

                {/* LAYER 3: INTERSECTION POINTS & SPECIAL DECORATIONS */}
                {Object.entries(puzzle.topology.vertices).map(([vId, connectedEdges]) => {
                    const pos = vertices[vId];
                    const x = pos.x + PADDING;
                    const y = pos.y + PADDING;
                    const element = puzzle.elements.vertices?.[vId];

                    return (
                        <g key={vId}>
                            {/* Standard geometric node intersection point */}
                            <circle cx={x} cy={y} r={8} fill={puzzle.style.colors.pColor} />

                            {/* Witness Start Element Anchor point */}
                            {element?.id === 'start' && (
                                <circle cx={x} cy={y} r={20} fill={puzzle.style.colors.pColor} />
                            )}

                            {/* Witness Exit Cap Line Element point */}
                            {element?.id === 'end' && (() => {
                                const exitDir = element.properties?.[0]?.dir ?? 0;
                                const vec = DIRECTION_VECTORS[exitDir];
                                return (
                                    <line
                                        x1={x} y1={y}
                                        x2={x + vec.x * 24} y2={y + vec.y * 24}
                                        stroke={puzzle.style.colors.pColor}
                                        strokeWidth={16}
                                        strokeLinecap="round"
                                    />
                                );
                            })()}
                        </g>
                    );
                })}

                {/* LAYER 4: ACTIVE PLAYER GLOWING OVERLAY LINE */}
                {playerPath.map((vId, index) => {
                    if (index === 0) return null;
                    const prevV = playerPath[index - 1];
                    const pA = vertices[prevV];
                    const pB = vertices[vId];

                    return (
                        <line
                            key={`player-segment-${index}`}
                            x1={pA.x + PADDING} y1={pA.y + PADDING}
                            x2={pB.x + PADDING} y2={pB.y + PADDING}
                            stroke={puzzle.style.colors.lColor}
                            strokeWidth={10}
                            strokeLinecap="round"
                        />
                    );
                })}
                <rect width="100%" height="100%" fill="url(#vignette)" pointer-events="none" />

            </svg>
        </div>
    );
}
