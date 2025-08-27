// 指纹SVG渲染组件
import React from 'react';

export interface FingerprintSVGProps {
  pattern: string;
  className?: string;
  size?: number;
}

const FingerprintSVG: React.FC<FingerprintSVGProps> = ({ 
  pattern, 
  className = '', 
  size = 120 
}) => {
  return (
    <div className={className}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
        style={{ background: '#f0f0f0', borderRadius: '50%' }}
      >
        {/* 背景圆 */}
        <circle
          cx="60"
          cy="60"
          r="55"
          fill="#ffffff"
          stroke="#ddd"
          strokeWidth="1"
        />
        
        {/* 指纹纹路 */}
        <path
          d={pattern}
          fill="none"
          stroke="#333"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* 添加一些细节纹理 */}
        <g opacity="0.6">
          {/* 中心点 */}
          <circle cx="60" cy="60" r="2" fill="#666" />
          
          {/* 随机细节点 */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 25 + (i % 3) * 8;
            const x = 60 + Math.cos(angle) * radius;
            const y = 60 + Math.sin(angle) * radius;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="0.8"
                fill="#888"
              />
            );
          })}
        </g>
        
        {/* 外圈装饰 */}
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="#ccc"
          strokeWidth="0.5"
          strokeDasharray="2,2"
        />
      </svg>
    </div>
  );
};

export default FingerprintSVG;
