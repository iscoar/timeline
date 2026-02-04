import { useEffect, useState } from "react"

export default function Clock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const hours = time.getHours()
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()

  // Calculate rotation angles
  const hourRotation = (hours % 12) * 30 + minutes * 0.5 // 30 degrees per hour + adjustment for minutes
  const minuteRotation = minutes * 6 + seconds * 0.1 // 6 degrees per minute

  // Hour marker positions (12 markers)
  const hourMarkers = Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30 - 90 // Start from 12 o'clock position
    const radians = (angle * Math.PI) / 180
    const radius = 140 // Distance from center
    const x = Math.cos(radians) * radius
    const y = Math.sin(radians) * radius
    return { x, y, rotation: angle + 90 }
  })

  return (
    <div className="w-full h-full bg-stone-100 flex items-center justify-center relative">
      {/* Textured background overlay covering the Clock component container (non-interactive) */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          width: '100%',
          height: '100%'
        }}
      />

      <div className="relative w-80 h-80 md:w-96 md:h-96">
        {/* Clock face */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Hour markers */}
          {hourMarkers.map((marker, index) => (
            <div
              key={index}
              className="absolute"
              style={{
                transform: `translate(${marker.x}px, ${marker.y}px) rotate(${marker.rotation}deg)`,
              }}
            >
              <div 
                className="w-3 h-8 md:w-4 md:h-10 bg-slate-800 rounded-sm"
                style={{
                  boxShadow: "2px 3px 4px rgba(0, 0, 0, 0.3)",
                }}
              />
            </div>
          ))}

          {/* Center point */}
          <div 
            className="absolute w-3 h-3 md:w-4 md:h-4 bg-slate-600 rounded-full z-30"
            style={{
              boxShadow: "1px 2px 3px rgba(0, 0, 0, 0.3)",
            }}
          />

          {/* Hour hand */}
          <div
            className="absolute origin-bottom z-20"
            style={{
              transform: `rotate(${hourRotation}deg)`,
              bottom: "50%",
            }}
          >
            <div 
              className="w-2.5 h-20 md:w-3 md:h-24 bg-slate-800 rounded-sm"
              style={{
                boxShadow: "3px 4px 6px rgba(0, 0, 0, 0.35)",
                clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
              }}
            />
          </div>

          {/* Minute hand */}
          <div
            className="absolute origin-bottom z-10"
            style={{
              transform: `rotate(${minuteRotation}deg)`,
              bottom: "50%",
            }}
          >
            <div 
              className="w-2 h-28 md:w-2.5 md:h-36 bg-slate-800 rounded-sm"
              style={{
                boxShadow: "3px 4px 8px rgba(0, 0, 0, 0.35)",
                clipPath: "polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
