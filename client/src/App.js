import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import OnBoarding from './pages/OnBoarding'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {useCookies} from "react-cookie";
import {OauthLogger} from './components/OauthLogger'
import { useEffect } from 'react';
import axios from 'axios';

const App = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['user'])
    const authToken = cookies.AuthToken
    
    
      useEffect(()=>{
        const checkToken = async () => {
          if(cookies.UserId!=null){
            const res = await axios.get('http://localhost:8000/exist',{params:{
                user_id:cookies.UserId,
            }})
            if(res.data=='noUser'){
              removeCookie('UserId')
              removeCookie('AuthToken')
              window.location.reload()
            }
          }
        }
      
        checkToken();
        
    },[])
      
   
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>}/>
            {authToken && <Route path="/dashboard" element={<Dashboard/>}/>}
            {authToken && <Route path="/onboarding" element={<OnBoarding/>}/>}
            <Route path='/oauthlogger/:data' element={<OauthLogger/>}/>
        </Routes>
      </BrowserRouter>
  )
}


export default App;
