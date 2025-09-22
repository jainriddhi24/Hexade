import React from 'react'

interface PageHeroProps {
  title: string
  highlightedText: string
  description: string
}

export function PageHero({ title, highlightedText, description }: PageHeroProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent h-96"></div>
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(45%_60%_at_50%_0%,rgba(59,130,246,0.12)_0,rgba(59,130,246,0)_100%)]"></div>
      <div className="relative container mx-auto px-4 pt-16 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              {title} <span className="text-blue-600">{highlightedText}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}