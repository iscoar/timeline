import React from "react";

type LoadingProps = {
  size?: number;
  text?: string;
};

export default function Loading({ size = 64, text = "Cargando..." }: LoadingProps) {
  const dotSize = Math.round(size / 4);
  const gap = Math.round(size / 16);

  const styles = `
    @keyframes copilot-bounce {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.3 }
      40% { transform: translateY(-12px); opacity: 1 }
    }
    .copilot-loader-dot { width: ${dotSize}px; height: ${dotSize}px; background: #3B82F6; border-radius: 9999px; margin: 0 ${gap}px; display: inline-block }
    .copilot-loader-dot:nth-child(1) { animation: copilot-bounce 1.2s infinite 0.05s }
    .copilot-loader-dot:nth-child(2) { animation: copilot-bounce 1.2s infinite 0.15s }
    .copilot-loader-dot:nth-child(3) { animation: copilot-bounce 1.2s infinite 0.25s }
  `;

  return (
    <div className="bg-[#F1F4F9] min-h-screen flex items-center justify-center">
      <style>{styles}</style>
      <div role="status" aria-live="polite" className="flex flex-col items-center">
        <div className="flex items-end" aria-hidden="true">
          <span className="copilot-loader-dot" />
          <span className="copilot-loader-dot" />
          <span className="copilot-loader-dot" />
        </div>
        <div className="mt-4 text-sm text-gray-500">{text}</div>
        <span className="sr-only">{text}</span>
      </div>
    </div>
  );
}
