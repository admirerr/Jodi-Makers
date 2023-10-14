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
        const checkToken = async () => { //when the tab get's closed the authToken still perisit's this function remove's that
          if(cookies.UserId!=null){
            const res = await axios.get('http://localhost:8000/exist',{params:{ //call exist endpoint to check if the token is still valid
                user_id:cookies.UserId,
            }})
            if(res.data=='noUser'){ //if server say's it is invalid delete the token
              removeCookie('UserId') //delete the cookie's
              removeCookie('AuthToken')
              window.location.reload()//trigger a reload to take the user to the right page
            }
          }
        }
      
        checkToken();//call the function
        
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
