"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Unlock, ChevronRight, AlertTriangle } from 'lucide-react'
import { MatrixRain } from '@/components/matrix-rain'
import { SierpinskiFractal } from '@/components/sierpinski-fractal'
import { FileUpload } from '@/components/file-upload'
import { encryptAndEmbed, extractAndDecrypt } from '@/lib/steganography'
import { Progress } from "@/components/ui/progress"

export default function SteganographyTool() {
  // Encryption state
  const [input, setInput] = useState('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [hash, setHash] = useState('')
  const [encryptedText, setEncryptedText] = useState('')
  
  // Decryption state
  const [decryptInput, setDecryptInput] = useState('')
  const [hashKey, setHashKey] = useState('')
  const [decryptedText, setDecryptedText] = useState('')
  
  // UI state
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('')
  const [coverImagePreview, setCoverImagePreview] = useState<string>('')
  const [stegoImage, setStegoImage] = useState<string>('')
  const [encryptedImage, setEncryptedImage] = useState<File | null>(null)
  const [encryptedImagePreview, setEncryptedImagePreview] = useState<string>('')
  const [isValidHash, setIsValidHash] = useState<boolean>(false)
  const [decryptionProgress, setDecryptionProgress] = useState(0)
  const [decryptionStage, setDecryptionStage] = useState('')

  const handleGenerateHash = async () => {
    if (!input) {
      setError('Please enter text to generate a hash')
      return
    }

    setStage('Generating Hash')
    setProgress(0)

    const newHash = Array.from({ length: 2187 }, (_, i) => {
      setProgress(Math.floor((i / 2186) * 100))
      const charCode = input.charCodeAt(i % input.length)
      const value = ((charCode + i) % 3) - 1
      return value === -1 ? '-' : value.toString()
    }).join('')

    setHash(newHash)
    setError('')
    setStage('')
    setProgress(100)
  }

  const handleEncrypt = async () => {
    try {
      if (!input || !hash || !coverImage) {
        setError('Please enter message, generate hash, and select a cover image')
        return
      }
      const result = await encryptAndEmbed(input, hash, coverImage, setProgress, setStage)
      setEncryptedText(result.encryptedText)
      setStegoImage(result.stegoImage)
      setError('')
    } catch (err) {
      setError('Encryption failed: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleDecrypt = async () => {
    try {
      if ((!decryptInput && !encryptedImage) || !hashKey) {
        setError('Please provide encrypted data (text or image) and hash key')
        return
      }
      const result = await extractAndDecrypt(
        encryptedImage || decryptInput,
        hashKey,
        setDecryptionProgress,
        setDecryptionStage
      )
      setDecryptedText(result)
      setError('')
    } catch (err) {
      setError('Decryption failed: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleHashKeyFile = async (file: File) => {
    try {
      const text = await file.text()
      setHashKey(text)
    } catch (err) {
      setError('Invalid hash key file')
    }
  }

  const handleCoverImageSelect = (file: File) => {
    setCoverImage(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setCoverImagePreview(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleEncryptedImageSelect = (file: File) => {
    setEncryptedImage(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setEncryptedImagePreview(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleHashKeyChange = (value: string) => {
    setHashKey(value)
    setIsValidHash(/^[-01]+$/.test(value) && value.length === 2187)
  }

  return (
    <div className="min-h-screen bg-black text-cyan-500">
      <MatrixRain />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-cyan-500">BASE-3 ENCRYPTION</h1>
          <p className="text-cyan-400">Secure your data with balanced ternary computing</p>
        </div>

        <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            {/* Encryption Section */}
            <Card className="bg-black/80 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-500">Encrypt Message</CardTitle>
                <CardDescription className="text-cyan-400">
                  Enter your message and generate a ternary hash key
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="input" className="text-cyan-400">Message</Label>
                  <Textarea
                    id="input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="bg-black/50 border-cyan-500/30 text-cyan-500"
                    placeholder="Enter message to encrypt"
                  />
                </div>
                
                <FileUpload
                  onFileSelect={handleCoverImageSelect}
                  label="Select Cover Image"
                  accept="image/*"
                />

                {coverImagePreview && (
                  <div className="mt-4">
                    <Label className="text-cyan-400">Cover Image Preview</Label>
                    <div className="mt-2 relative aspect-video w-full overflow-hidden rounded-lg border border-cyan-500/30">
                      <img
                        src={coverImagePreview}
                        alt="Cover"
                        className="object-contain w-full h-full"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={handleGenerateHash}
                    className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-500"
                  >
                    Generate Hash <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={handleEncrypt}
                    className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-500"
                    disabled={!input || !hash || !coverImage}
                  >
                    <Lock className="mr-2 h-4 w-4" /> Encrypt
                  </Button>
                </div>

                {stegoImage && (
                  <div className="mt-4">
                    <Label className="text-cyan-400">Encrypted Image</Label>
                    <div className="mt-2 relative aspect-video w-full overflow-hidden rounded-lg border border-cyan-500/30">
                      <img
                        src={stegoImage}
                        alt="Encrypted"
                        className="object-contain w-full h-full"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = stegoImage
                        link.download = 'encrypted-image.png'
                        link.click()
                      }}
                      className="mt-2 w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-500"
                    >
                      Download Encrypted Image
                    </Button>
                  </div>
                )}

                {encryptedText && (
                  <div>
                    <Label className="text-cyan-400">Encrypted Result</Label>
                    <Textarea
                      value={encryptedText}
                      readOnly
                      className="bg-black/50 border-cyan-500/30 text-cyan-500"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Decryption Section */}
            <Card className="bg-black/80 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-500">Decrypt Message</CardTitle>
                <CardDescription className="text-cyan-400">
                  Decrypt using encrypted data and hash key
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-cyan-400">Encrypted Text or Image</Label>
                  <Textarea
                    value={decryptInput}
                    onChange={(e) => setDecryptInput(e.target.value)}
                    className="bg-black/50 border-cyan-500/30 text-cyan-500"
                    placeholder="Enter encrypted text or upload encrypted image"
                  />
                </div>

                <FileUpload
                  onFileSelect={handleEncryptedImageSelect}
                  label="Upload Encrypted Image"
                  accept="image/*"
                />

                {encryptedImagePreview && (
                  <div className="mt-4">
                    <Label className="text-cyan-400">Encrypted Image Preview</Label>
                    <div className="mt-2 relative aspect-video w-full overflow-hidden rounded-lg border border-cyan-500/30">
                      <img
                        src={encryptedImagePreview}
                        alt="Encrypted"
                        className="object-contain w-full h-full"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-cyan-400">Hash Key</Label>
                  <Textarea
                    value={hashKey}
                    onChange={(e) => handleHashKeyChange(e.target.value)}
                    className="bg-black/50 border-cyan-500/30 text-cyan-500"
                    placeholder="Enter hash key or upload hash key file"
                  />
                </div>

                <FileUpload
                  onFileSelect={handleHashKeyFile}
                  label="Upload Hash Key File"
                  accept=".txt"
                />

                <Button 
                  onClick={handleDecrypt}
                  className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-500"
                  disabled={(!decryptInput && !encryptedImage) || !hashKey}
                >
                  <Unlock className="mr-2 h-4 w-4" /> Decrypt
                </Button>

                {decryptedText && (
                  <div>
                    <Label className="text-cyan-400">Decrypted Message</Label>
                    <Textarea
                      value={decryptedText}
                      readOnly
                      className="bg-black/50 border-cyan-500/30 text-cyan-500"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Sierpinski Visualization */}
          <div className="space-y-8">
            {hash && (
              <Card className="bg-black/80 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-cyan-500">Hash Key Visualization</CardTitle>
                  <CardDescription className="text-cyan-400">
                    2187-node fractal representation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SierpinskiFractal hash={hash} />
                </CardContent>
              </Card>
            )}

            {hashKey && (
              <Card className="bg-black/80 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-cyan-500">Hash Key Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`p-4 rounded-lg border ${
                    isValidHash 
                      ? 'border-green-500/30 bg-green-500/10 text-green-500'
                      : 'border-red-500/30 bg-red-500/10 text-red-500'
                  }`}>
                    {isValidHash 
                      ? 'Valid hash key detected'
                      : 'Invalid hash key format - Must be 2187 characters of -1, 0, 1'}
                  </div>
                </CardContent>
              </Card>
            )}

            {(decryptionProgress > 0 || decryptionStage) && (
              <Card className="bg-black/80 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-cyan-500">Decryption Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={decryptionProgress} className="w-full" />
                  <p className="mt-2 text-center text-cyan-400">{decryptionStage}</p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-black/80 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-500">Process Walkthrough</CardTitle>
                <CardDescription className="text-cyan-400">
                  Step-by-step encryption process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-cyan-400">
                  <div>
                    <h3 className="font-semibold mb-2 text-cyan-500">Ternary Encryption</h3>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Convert message to balanced ternary (-1, 0, 1)</li>
                      <li>Generate 2187-node Sierpinski hash key</li>
                      <li>Apply ternary XOR operation with hash key</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2 text-cyan-500">Steganography</h3>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Process cover image for data embedding</li>
                      <li>Embed encrypted ternary data in image LSBs</li>
                      <li>Generate downloadable steganographic image</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 text-cyan-500">Security Features</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Quantum-resistant ternary operations</li>
                      <li>Visual hash key verification</li>
                      <li>LSB steganography for undetectable embedding</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-500">
            <AlertTriangle className="inline-block mr-2" />
            {error}
          </div>
        )}
      </main>
    </div>
  )
}

