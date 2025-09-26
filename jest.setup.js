// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock next/navigation
const useRouter = jest.fn()
useRouter.mockReturnValue({
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
})

jest.mock('next/navigation', () => ({
  useRouter,
  usePathname: () => '/',
}))
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock WebSocket
global.WebSocket = class WebSocket {
  constructor(url) {
    this.url = url
    this.readyState = 1
    this.onopen = null
    this.onclose = null
    this.onmessage = null
    this.onerror = null
  }
  
  send(data) {
    // Mock send
  }
  
  close() {
    // Mock close
  }
}

// Mock MediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn(() => Promise.resolve({
      getTracks: () => [],
      getVideoTracks: () => [],
      getAudioTracks: () => [],
    })),
  },
})

// Mock RTCPeerConnection
global.RTCPeerConnection = class RTCPeerConnection {
  constructor(config) {
    this.config = config
    this.localDescription = null
    this.remoteDescription = null
    this.iceConnectionState = 'new'
    this.ontrack = null
    this.onicecandidate = null
  }
  
  createOffer() {
    return Promise.resolve({ type: 'offer', sdp: 'mock-sdp' })
  }
  
  createAnswer() {
    return Promise.resolve({ type: 'answer', sdp: 'mock-sdp' })
  }
  
  setLocalDescription(description) {
    this.localDescription = description
    return Promise.resolve()
  }
  
  setRemoteDescription(description) {
    this.remoteDescription = description
    return Promise.resolve()
  }
  
  addIceCandidate(candidate) {
    return Promise.resolve()
  }
  
  addTrack(track, stream) {
    return {}
  }
  
  close() {
    // Mock close
  }
}
