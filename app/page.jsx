"use client"

import { useState, useRef } from "react"

export default function DictionaryApp() {
  const [word, setWord] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const audioRef = useRef(null)

  const searchWord = async (searchTerm) => {
    const trimmedWord = searchTerm.trim()

    if (!trimmedWord) {
      setError("Please enter a word")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${trimmedWord}`)

      if (!response.ok) {
        setError("Word not found. Please try another word.")
        setLoading(false)
        return
      }

      const data = await response.json()
      setResult(data[0])
    } catch (err) {
      setError("Error fetching data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    searchWord(word)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchWord(word)
    }
  }

  const playAudio = (audioUrl) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl
      audioRef.current.play()
    }
  }

  const getAudioUrl = () => {
    if (!result || !result.phonetics) return null
    for (const phonetic of result.phonetics) {
      if (phonetic.audio) {
        return phonetic.audio
      }
    }
    return null
  }

  const getPhonetic = () => {
    if (!result || !result.phonetics) return null
    for (const phonetic of result.phonetics) {
      if (phonetic.text) {
        return phonetic.text
      }
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-900 dark:text-white mb-2">Dictionary</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Search for any English word to get its meaning, pronunciation, and examples
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter a word..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Word search input"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition duration-200"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-100 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
            {/* Word Header */}
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{result.word}</h2>
                  {getPhonetic() && (
                    <p className="text-lg text-indigo-600 dark:text-indigo-400 font-semibold">{getPhonetic()}</p>
                  )}
                </div>
                {getAudioUrl() && (
                  <button
                    onClick={() => playAudio(getAudioUrl())}
                    className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition duration-200"
                    aria-label="Play audio pronunciation"
                    title="Play pronunciation"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Meanings */}
            {result.meanings && result.meanings.length > 0 && (
              <div className="space-y-6">
                {result.meanings.map((meaning, idx) => (
                  <div key={idx}>
                    {/* Part of Speech */}
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white italic">{meaning.partOfSpeech}</h3>
                      <div className="flex-1 h-px bg-gray-300 dark:bg-slate-600"></div>
                    </div>

                    {/* Definitions */}
                    {meaning.definitions && meaning.definitions.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-3">
                          Meaning
                        </h4>
                        <ul className="space-y-2">
                          {meaning.definitions.map((def, defIdx) => (
                            <li key={defIdx} className="flex gap-3">
                              <span className="text-indigo-600 dark:text-indigo-400 font-bold mt-1">•</span>
                              <div>
                                <p className="text-gray-800 dark:text-gray-200">{def.definition}</p>
                                {def.example && (
                                  <p className="text-gray-600 dark:text-gray-400 italic mt-1">Example: {def.example}</p>
                                )}
                                {!def.example && (
                                  <p className="text-gray-500 dark:text-gray-500 italic mt-1">Example not available</p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Synonyms */}
                    {meaning.synonyms && meaning.synonyms.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-3">
                          Synonyms
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {meaning.synonyms.map((synonym, synIdx) => (
                            <span
                              key={synIdx}
                              className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-semibold cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800 transition"
                              onClick={() => {
                                setWord(synonym)
                                searchWord(synonym)
                              }}
                            >
                              {synonym}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Source URL */}
            {result.sourceUrls && result.sourceUrls.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Source:</p>
                <a
                  href={result.sourceUrls[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                >
                  {result.sourceUrls[0]}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Searching...</p>
          </div>
        )}

        {/* Empty State */}
        {!result && !error && !loading && (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">Start by searching for a word above</p>
          </div>
        )}
      </div>

      {/* Audio element */}
      <audio ref={audioRef} />
    </div>
  )
}
