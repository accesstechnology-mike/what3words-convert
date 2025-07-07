import React, { useState } from 'react'
import {
  Card,
  CardBody,
  Input,
  Button,
  Alert,
  Typography,
  IconButton,
  Tooltip,
  Spinner
} from '@material-tailwind/react'
import {
  MapPinIcon,
  GlobeAltIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  MapIcon
} from '@heroicons/react/24/outline'
import {
  MapPinIcon as MapPinSolid,
  HeartIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid'

// Brand Logo Components
const GoogleLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

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
        country: data.country,

        nearestPlace: data.nearestPlace,
        region: data.region,
        language: data.language,
        words: data.words,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 py-6 sm:py-12">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl floating-animation" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl floating-animation" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative max-w-md mx-auto lg:max-w-2xl">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
              <div className="relative bg-white p-4 rounded-2xl shadow-xl">
                <MapPinSolid className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              </div>
            </div>
          </div>
          
          <Typography 
            variant="h1" 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 gradient-text"
          >
            What3Words → Map
          </Typography>
          
          <Typography 
            variant="lead" 
            className="text-gray-600 text-base sm:text-lg max-w-md mx-auto leading-relaxed"
          >
Convert What3Words addresses into links for Google and Apple Maps.          </Typography>
          
 
        </div>

        {/* Main Card */}
        <Card className="glass-effect border-0 shadow-2xl animate-slide-up">
          <CardBody className="p-6 sm:p-8">
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Typography variant="h6" className="text-gray-800 font-semibold">
                  Enter What3Words Address
                </Typography>
                <div className="relative group">
                  <Input
                    type="text"
                    autoComplete="off"
                    data-1p-ignore
                    data-lpignore="true"
                    size="lg"
                    placeholder="e.g., index.home.raft"
                    value={w3wInput}
                    onChange={(e) => setW3wInput(e.target.value)}
                    icon={<MapPinIcon className="w-5 h-5" />}
                    className="!border-gray-300 focus:!border-blue-500 text-base font-medium"
                    labelProps={{
                      className: "hidden"
                    }}
                    containerProps={{
                      className: "min-w-0"
                    }}
                  />
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity -z-10"></div>
                </div>
              </div>
              
              <Button
                type="submit"
                size="lg"
                disabled={!w3wInput.trim() || loading}
                className="w-full gradient-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] font-semibold text-white border-0"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Spinner className="w-4 h-4" />
                    Converting...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Convert to Maps
                    <ArrowRightIcon className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Error Display */}
            {error && (
              <div className="mt-6 animate-slide-up">
                <Alert
                  color="blue"
                  variant="outlined"
                  icon={<InformationCircleIcon className="w-5 h-5" />}
                  className="text-sm font-medium bg-blue-50/50 border-blue-200"
                >
                  {error}
                </Alert>
              </div>
            )}

            {/* Results */}
            {coordinates && (
              <div className="mt-6 space-y-5 animate-slide-up">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                
                {/* Location Found Header */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <Typography variant="h6" className="font-bold text-gray-800">
                      Location Found
                    </Typography>
                  </div>
                  
                                    {/* Location Information */}
                  {(coordinates.nearestPlace || coordinates.country) && (
                    <div className="mb-6">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {coordinates.nearestPlace && (
                          <div className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4 text-gray-500" />
                            <Typography className="text-sm font-semibold text-gray-700">
                              {(() => {
                                const parts = coordinates.nearestPlace.split(',');
                                if (parts.length > 1) {
                                  return (
                                    <>
                                      {parts[0].trim()}
                                      <span className="text-gray-500 font-normal">
                                        , {parts.slice(1).join(',').trim()}
                                      </span>
                                    </>
                                  );
                                }
                                return coordinates.nearestPlace;
                              })()}
                              {coordinates.region && coordinates.region !== coordinates.nearestPlace && (
                                <span className="text-gray-500 font-normal">, {coordinates.region}</span>
                              )}
                            </Typography>
                          </div>
                        )}
                        {coordinates.country && (
                          <div className="flex items-center gap-1">
                            <GlobeAltIcon className="w-4 h-4 text-gray-500" />
                            <Typography className="text-sm text-gray-600">
                              {coordinates.country}
                            </Typography>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Map Action Buttons - Now Prominent */}
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MapIcon className="w-4 h-4 text-blue-500" />
                    <Typography variant="h6" className="font-semibold text-gray-800 text-center">
                      Open in Maps
                    </Typography>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="filled"
                        color="gray"
                        size="sm"
                        className="flex-1 shadow-md hover:shadow-lg transition-all bg-gray-100 hover:bg-gray-200 text-gray-800"
                        onClick={() => openMap(coordinates.google)}
                      >
                        <div className="flex items-center gap-2">
                          <GoogleLogo className="w-4 h-4" />
                          <span className="text-gray-800">Google Maps</span>
                        </div>
                      </Button>
                      <Tooltip content={copiedLink === 'google' ? 'Copied!' : 'Copy link'}>
                        <IconButton
                          variant={copiedLink === 'google' ? 'gradient' : 'outlined'}
                          color={copiedLink === 'google' ? 'green' : 'blue-gray'}
                          size="sm"
                          onClick={() => copyToClipboard(coordinates.google, 'google')}
                          className="shadow-md hover:shadow-lg transition-all"
                        >
                          {copiedLink === 'google' ? 
                            <CheckIcon className="w-4 h-4" /> : 
                            <ClipboardDocumentIcon className="w-4 h-4" />
                          }
                        </IconButton>
                      </Tooltip>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="filled"
                        color="blue-gray"
                        size="sm"
                        className="flex-1 shadow-md hover:shadow-lg transition-all"
                        onClick={() => openMap(coordinates.apple)}
                      >
                        <div className="flex items-center gap-2">
                          <AppleLogo className="w-4 h-4 text-white" />
                          <span className="text-white">Apple Maps</span>
                        </div>
                      </Button>
                      <Tooltip content={copiedLink === 'apple' ? 'Copied!' : 'Copy link'}>
                        <IconButton
                          variant={copiedLink === 'apple' ? 'gradient' : 'outlined'}
                          color={copiedLink === 'apple' ? 'green' : 'blue-gray'}
                          size="sm"
                          onClick={() => copyToClipboard(coordinates.apple, 'apple')}
                          className="shadow-md hover:shadow-lg transition-all"
                        >
                          {copiedLink === 'apple' ? 
                            <CheckIcon className="w-4 h-4" /> : 
                            <ClipboardDocumentIcon className="w-4 h-4" />
                          }
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                </div>

         

                {/* Embedded Map Preview */}
                <div className="space-y-3 pt-2 ">
                  {/* <Typography variant="h6" className="font-semibold text-gray-800 text-center">
                    Map Preview
                  </Typography> */}
                  <div className="overflow-hidden rounded-xl border border-gray-200 shadow-lg h-48 sm:h-64">
                    <iframe
                      src={`https://maps.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}&z=15&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full"
                      title="Location Preview"
                    />
                  </div>
                </div>

                       {/* Coordinates - Now Before Map */}
                       <div className="text-center border-t border-gray-100">
                  <Typography className="text-xs text-gray-500 mb-1">
                    Coordinates
                  </Typography>
                  <Typography className="font-mono text-sm text-gray-600">
                    {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                  </Typography>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-12 animate-fade-in">
          <Typography variant="small" className="text-gray-500">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              Built with{' '}
              <HeartIcon className="w-4 h-4 text-red-500 animate-pulse" />
              {' '}using{' '}
              <a 
                href="https://www.material-tailwind.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Material Tailwind
              </a>
              <span className="hidden sm:inline">{' '}•{' '}</span>
              <span className="block sm:inline w-full sm:w-auto">
                <a 
                  href="https://what3words.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Data from What3Words
                </a>
              </span>
            </div>
          </Typography>
        </div>
      </div>
    </div>
  )
}

export default App 