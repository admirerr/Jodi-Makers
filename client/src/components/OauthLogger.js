import { useParams} from "react-router-dom"
import { useCookies } from "react-cookie";
//this is a logical component
//when the react router mount's this project the login process take's place
const OauthLogger=()=>{
    const {data}=useParams();    
    const [cookies, setCookie, removeCookie] = useCookies(['user'])
 
    const response=JSON.parse(data)
    async function handleCookies(){
       try{       
        setCookie('UserId', response.userId,{path:'/'}) //set the cookie's
        setCookie('AuthToken', response.token,{path:'/'})
        if(response.logged=='true'){
            window.location.href='http://localhost:3000/dashboard' //callback url based on registered status
        }
        else{
            window.location.href='http://localhost:3000/onboarding'
        }
        
       }catch(e){
        console.log(e);
       }
      
    }
    handleCookies()
    return <></>;
}

export {OauthLogger};