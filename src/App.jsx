import React, { useState } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Chip,
  Divider,
  Link,
  Spinner,
  Tooltip
} from '@heroui/react'
import { 
  MapPinIcon, 
  GlobeAltIcon, 
  DevicePhoneMobileIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'

function App() {
  const [w3wInput, setW3wInput] = useState('')
  const [coordinates, setCoordinates] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedLink, setCopiedLink] = useState('')

  const buildLinks = (lat, lng) => {
    const google = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    const apple = `https://maps.apple.com/?q=${lat},${lng}`
    return { google, apple }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!w3wInput.trim()) return

    setLoading(true)
    setError('')
    setCoordinates(null)
    setCopiedLink('')

    try {
      const response = await fetch('/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ w3w: w3wInput.trim() })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Conversion failed')
      }

      setCoordinates({
        latitude: data.latitude,
        longitude: data.longitude,
        ...buildLinks(data.latitude, data.longitude)
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedLink(type)
      setTimeout(() => setCopiedLink(''), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const openMap = (url) => {
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
              <MapPinIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            What3Words → Map
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Convert addresses to coordinates instantly
          </p>
        </div>

        {/* Main Card */}
        <Card className="w-full shadow-lg border-0 bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
          <CardBody className="p-6 space-y-6">
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="e.g., index.home.raft"
                value={w3wInput}
                onChange={(e) => setW3wInput(e.target.value)}
                startContent={<MapPinIcon className="w-5 h-5 text-gray-400" />}
                size="md"
                variant="bordered"
                isRequired
                className="text-base"
                classNames={{
                  input: "text-base font-medium",
                  inputWrapper: "h-12 border hover:border-primary-300 focus-within:border-primary-500"
                }}
              />
              <Button
                type="submit"
                color="primary"
                size="md"
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md"
                isLoading={loading}
                isDisabled={!w3wInput.trim()}
              >
                {loading ? 'Converting...' : 'Convert'}
              </Button>
            </form>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-400">
                <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Results */}
            {coordinates && (
              <div className="space-y-4">
                <Divider />
                
                {/* Coordinates Display */}
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Location</h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <MapPinIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-mono text-sm font-medium text-gray-800 dark:text-white">
                      {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                    </span>
                  </div>
                </div>

                {/* Map Action Buttons */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      startContent={<GlobeAltIcon className="w-4 h-4" />}
                      onClick={() => openMap(coordinates.google)}
                      className="flex-1 font-medium bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                    >
                      Google Maps
                    </Button>
                    <Tooltip content={copiedLink === 'google' ? 'Copied!' : 'Copy link'}>
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onClick={() => copyToClipboard(coordinates.google, 'google')}
                        className="min-w-8 w-8 h-8"
                      >
                        {copiedLink === 'google' ? <CheckIcon className="w-4 h-4 text-green-500" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                      </Button>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      startContent={<DevicePhoneMobileIcon className="w-4 h-4" />}
                      onClick={() => openMap(coordinates.apple)}
                      className="flex-1 font-medium bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    >
                      Apple Maps
                    </Button>
                    <Tooltip content={copiedLink === 'apple' ? 'Copied!' : 'Copy link'}>
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onClick={() => copyToClipboard(coordinates.apple, 'apple')}
                        className="min-w-8 w-8 h-8"
                      >
                        {copiedLink === 'apple' ? <CheckIcon className="w-4 h-4 text-green-500" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                      </Button>
                    </Tooltip>
                  </div>
                </div>

                {/* Embedded Map */}
                <div className="space-y-2 hidden md:block">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview</h3>
                  <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 h-48">
                    <iframe
                      src={`https://maps.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}&z=15&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500 dark:text-gray-500">
          <p>
            Built with{' '}
            <Link href="https://heroui.com" isExternal color="primary" className="font-medium text-xs">
              HeroUI
            </Link>
            {' '}and{' '}
            <Link href="https://tailwindcss.com" isExternal color="primary" className="font-medium text-xs">
              Tailwind CSS
            </Link>
            {' '}• Data from{' '}
            <Link href="https://what3words.com" isExternal color="primary" className="font-medium text-xs">
              What3Words
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default App 