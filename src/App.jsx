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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg transform transition-transform duration-300 hover:scale-110">
                <MapPinIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                What3Words → Map Converter
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
              Convert What3Words addresses to coordinates and open them in your favorite maps
            </p>
          </div>

          {/* Main Card */}
          <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md transform transition-all duration-300 hover:shadow-3xl animate-slide-up rounded-2xl overflow-hidden">
            <CardHeader className="pb-6 pt-10">
              <div className="w-full text-center">
                <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-200 mb-2">
                  Enter What3Words Address
                </h2>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Type or paste a three-word address to get started
                </p>
              </div>
            </CardHeader>
            <CardBody className="space-y-8 px-10 pb-10">
              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="e.g., index.home.raft"
                    value={w3wInput}
                    onChange={(e) => setW3wInput(e.target.value)}
                    startContent={<MapPinIcon className="w-5 h-5 text-gray-400" />}
                    size="lg"
                    variant="bordered"
                    isRequired
                    className="text-lg"
                    classNames={{
                      input: "text-lg font-semibold",
                      inputWrapper: "h-14 border-2 hover:border-primary-300 focus-within:border-primary-500"
                    }}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-1 font-medium">
                    Supports formats: index.home.raft, ///index.home.raft, index home raft
                  </p>
                </div>
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg transform transition-transform duration-200 hover:scale-105"
                  isLoading={loading}
                  isDisabled={!w3wInput.trim()}
                >
                  {loading ? 'Converting...' : 'Convert to Coordinates'}
                </Button>
              </form>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Results */}
              {coordinates && (
                <div className="space-y-6">
                  <Divider />
                  
                  {/* Coordinates Display */}
                  <div className="text-center space-y-3 animate-fade-in">
                    <h3 className="text-2xl font-extrabold text-gray-800 dark:text-gray-200">Location Found</h3>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 transform transition-transform duration-300 hover:scale-105">
                      <MapPinIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-mono text-xl font-bold text-gray-800 dark:text-gray-200">
                        {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                      </span>
                    </div>
                  </div>

                  {/* Map Action Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    {/* Google Maps Card */}
                    <Card className="group hover:shadow-xl transition-all duration-200 border border-red-200 dark:border-red-800 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/10 dark:to-orange-900/10 transform hover:scale-105 rounded-xl overflow-hidden">
                      <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-200 dark:bg-red-900/30 rounded-lg">
                              <GlobeAltIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Google Maps</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Open in browser</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Tooltip content={copiedLink === 'google' ? 'Copied!' : 'Copy link'}>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="text-gray-500 hover:text-red-600 transition-colors"
                                onClick={() => copyToClipboard(coordinates.google, 'google')}
                              >
                                {copiedLink === 'google' ? (
                                  <CheckIcon className="w-4 h-4 text-green-500" />
                                ) : (
                                  <ClipboardDocumentIcon className="w-4 h-4" />
                                )}
                              </Button>
                            </Tooltip>
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              endContent={<ArrowTopRightOnSquareIcon className="w-4 h-4" />}
                              onClick={() => openMap(coordinates.google)}
                              className="font-medium"
                            >
                              Open
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Apple Maps Card */}
                    <Card className="group hover:shadow-xl transition-all duration-200 border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 transform hover:scale-105 rounded-xl overflow-hidden">
                      <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <DevicePhoneMobileIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Apple Maps</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Open in app</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Tooltip content={copiedLink === 'apple' ? 'Copied!' : 'Copy link'}>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="text-gray-500 hover:text-blue-600 transition-colors"
                                onClick={() => copyToClipboard(coordinates.apple, 'apple')}
                              >
                                {copiedLink === 'apple' ? (
                                  <CheckIcon className="w-4 h-4 text-green-500" />
                                ) : (
                                  <ClipboardDocumentIcon className="w-4 h-4" />
                                )}
                              </Button>
                            </Tooltip>
                            <Button
                              size="sm"
                              color="primary"
                              variant="flat"
                              endContent={<ArrowTopRightOnSquareIcon className="w-4 h-4" />}
                              onClick={() => openMap(coordinates.apple)}
                              className="font-medium"
                            >
                              Open
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>

                  {/* Embedded Map */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Map Preview</h3>
                    <Card className="overflow-hidden border-0 shadow-lg">
                      <CardBody className="p-0">
                        <iframe
                          src={`https://maps.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}&z=15&output=embed`}
                          width="100%"
                          height="400"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          className="w-full"
                        />
                      </CardBody>
                    </Card>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Footer */}
          <div className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
            <p>
              Built with{' '}
              <Link href="https://heroui.com" isExternal color="primary" className="font-medium">
                HeroUI
              </Link>
              {' '}and{' '}
              <Link href="https://tailwindcss.com" isExternal color="primary" className="font-medium">
                Tailwind CSS
              </Link>
              {' '}• Data from{' '}
              <Link href="https://what3words.com" isExternal color="primary" className="font-medium">
                What3Words
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 