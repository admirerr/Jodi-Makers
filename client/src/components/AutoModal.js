import {useState,useEffect} from "react"
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useCookies} from "react-cookie";
import validator from 'validator'

const glassmorphismStyle = {
    background: 'rgba(255, 255, 255, 0.2)', 
    borderRadius: '10px',
    padding: '20px',
    backdropFilter: 'blur(10px)', 
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
  };

const AuthModal = ({ setShowModal, isSignUp }) => {
    const [email, setEmail] = useState(null)
    const [password, setPassword] = useState(null)
    const [confirmPassword, setConfirmPassword] = useState(null)
    const [error, setError] = useState(null)
    const [strongPassword,setstrongPassword]=useState('false');
    const [cookies, setCookie, removeCookie] = useCookies
    (['user'])
const [passwordMessage,setMessage]=useState('Enter a password having minimum 8 characters!');

    let navigate = useNavigate()
    //Adding a validate function which will return an empty string if the password is strong otherwise an error message
    const validate=(password)=>{
        if(validator.isEmpty(password)) return "Password cannot be empty";
        if(!validator.isStrongPassword(password,
          {minLength:8,
            minLowerCase:1,
            minUpperCase:1
            ,minNumbers:1,
            minSymbols:1})){
        return " It is a not a strong password . Try combination of lower case , upper case , numbers and symbols!";
          }
          else{ 
            setstrongPassword('true');
  return "It is a strong password";
          }
    }
    const handleGoogleLogin=(e)=>{
        try{
            e.preventDefault();
            window.location.href='http://localhost:8000/authgoogle'
        }
        catch{

        }
    }

    const handleClick = () => {
        setShowModal(false)
    }
   
    const handlepassword = (e) => {
        const newpassword = e.target.value;
        setPassword(newpassword);
        const message = validate(newpassword);  
        setMessage(message);
    }

    const handleSubmit = async (e) => {

        e.preventDefault()//page wont refresh .
    
        try {     
            if( isSignUp && (password !== confirmPassword) ) {
                setError('Passwords need to match!')
                return;
            }
if(isSignUp && strongPassword==='false'){
    setError('You cannot proceed until you enter a strong password');
    return;
}

               console.log('posting', email, password)
               const response = await axios.post(`http://localhost:8000/${isSignUp ? 'signup' : 'login'}`, { email, password })


            setCookie('AuthToken', response.data.token)
            setCookie('UserId', response.data.userId)

                const success = response.status === 201

            if(success && isSignUp) navigate('/onboarding')
            if(success && !isSignUp) navigate('/dashboard')

            window.location.reload()

        } catch (error) {
            console.log(error)
        }
    }

    return (

        <div className="auth-modal" style={glassmorphismStyle}>
            <div className="close-icon" onClick={handleClick}>ⓧ</div>
            <h2>{isSignUp ? 'Create Account' : 'Log In'}</h2>
            <p>By clicking Log In, you agree to our terms. Learn how we process your data in our Privacy Policy and Cookie Policy.</p>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="email"
                    required={true}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="password"
                    required={true}
                    onChange={handlepassword}
                />
    <p style={{color: 'red' ,fontSize:'12px', marginTop:'0',marginLeft:'0'}}>{passwordMessage}</p>
                {isSignUp && <input
                    type="password"
                    id="password-check"
                    name="password-check"
                    placeholder="confirm password"
                    required={true}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />}

                <input className="secondary-button" type="submit"/>
                <button  className="login-with-google-btn secondary-button" onClick={handleGoogleLogin} >
                    Continue With Google
                </button>
                <p>{error}</p>

            </form>
            <hr/>
            <h2>GET THE APP</h2>

        </div>
    )
}
export default AuthModal