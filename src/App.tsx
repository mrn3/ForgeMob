import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Dashboard } from './pages/Dashboard'
import { PresentationEditor } from './apps/presentation/PresentationEditor'
import { SocialEditor } from './apps/social/SocialEditor'
import { DocsEditor } from './apps/docs/DocsEditor'
import { SheetsEditor } from './apps/sheets/SheetsEditor'
import { WhiteboardEditor } from './apps/whiteboard/WhiteboardEditor'
import { PhotoEditor } from './apps/photo/PhotoEditor'
import { VideoEditor } from './apps/video/VideoEditor'
import { PrintEditor } from './apps/print/PrintEditor'
import { WebsiteEditor } from './apps/website/WebsiteEditor'
import { WebAppEditor } from './apps/webapp/WebAppEditor'
import { MobileAppEditor } from './apps/mobile/MobileAppEditor'

function App() {
  return (
    <BrowserRouter>
      <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/presentation/:docId" element={<ErrorBoundary><PresentationEditor /></ErrorBoundary>} />
          <Route path="/social/:docId" element={<SocialEditor />} />
          <Route path="/docs/:docId" element={<DocsEditor />} />
          <Route path="/sheets/:docId" element={<SheetsEditor />} />
          <Route path="/whiteboard/:docId" element={<WhiteboardEditor />} />
          <Route path="/photo/:docId" element={<ErrorBoundary><PhotoEditor /></ErrorBoundary>} />
          <Route path="/video/:docId" element={<VideoEditor />} />
          <Route path="/print/:docId" element={<PrintEditor />} />
          <Route path="/website/:docId" element={<WebsiteEditor />} />
          <Route path="/webapp/:docId" element={<WebAppEditor />} />
          <Route path="/mobile/:docId" element={<MobileAppEditor />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
