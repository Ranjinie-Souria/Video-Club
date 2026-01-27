import logo from './assets/logo.png';
import './App.css'
import { VideoConverter } from './features/videoConverter/videoConverter';

function App() {

  return (
  <>   
  <div className="navbar">
    <img className="logo" src={logo} alt="Logo" />
    <div className="main">
      <h1>Welcome to Video Club</h1>
      Convert any video or image to a video format (currently supported : mp4, mkv, webm) :
    <VideoConverter></VideoConverter>
    </div>
    </div>
    </>
  )
}

export default App
