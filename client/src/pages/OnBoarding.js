import {useState,useEffect} from "react"
import Nav from "../components/Nav"
import { useCookies} from "react-cookie"
import {useNavigate} from "react-router-dom"
import axios from "axios"

const OnBoarding = () => {

    const [cookies, setCookie, removeCookie] = useCookies(['user'])
    const [formData, setFormData] = useState({
        user_id: cookies.UserId,
        first_name: cookies.formData?cookies.formData.first_name:'',
        dob_day: cookies.formData?cookies.formData.dob_day:'',
        dob_month: cookies.formData?cookies.formData.dob_month:'',
        dob_year: cookies.formData?cookies.formData.dob_year:'',
        show_gender: cookies.formData?cookies.formData.show_gender:false,
        gender_identity: cookies.formData?cookies.formData.gender_identity:'man',
        gender_interest: cookies.formData?cookies.formData.gender_interest:'woman',
        url: cookies.formData?cookies.formData.url:'',
        about: cookies.formData?cookies.formData.about:'',
        matches: cookies.formData?cookies.formData.matches:[],

    })
    

    useEffect(()=>{
            
        const beforeUnloadHandler = async(event) => {
            setCookie('formData',JSON.stringify(formData),{path:'/'})
            axios.post('http://localhost:8000/abandon',formData);
            sessionStorage.setItem('redirect','true');          
        };
          
            window.addEventListener("beforeunload", beforeUnloadHandler);
            return (()=>{   
                window.removeEventListener("beforeunload", beforeUnloadHandler); 
            }  
     )  
    },[formData,removeCookie,setCookie])
   
    let navigate = useNavigate()
    
    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const response = await axios.put('http://localhost:8000/user', { formData })
            const success = response.status === 200
            if(success) {
                setCookie('formData',{})
                navigate('/dashboard')
                
            }
        } catch (err) {
            console.log(err)
        }
    }


    const handleChange = (e) => {
        console.log('e', e)
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value
        const name = e.target.name
    
        setFormData((prevState) => ({
            ...prevState,
            [name]: value
        }))
        

    }
    if(sessionStorage.getItem('redirect')!=null){
        
        sessionStorage.removeItem('redirect');
        removeCookie('UserId')
        removeCookie('AuthToken')
        window.location.href='http://localhost:3000'
    }
    
    return (
        <>
            <Nav
                minimal={true}
                setShowModal={() => {}}
                showModal={false}

            />
            <div className="onboarding">
                <h2>Create Account</h2>

                <form onSubmit={handleSubmit}>
                    <section>
                        <label htmlFor="first_name">First Name</label>
                        <input
                            id="first_name"
                            type='text'
                            name="first_name"
                            placeholder="First Name"
                            required={true}
                            value={formData.first_name}
                            onChange={handleChange}
                        />

                        <label>Birthday</label>
                        <div className="multiple-input-container">
                            <input
                              type="date"
                              id="dob"
                                name="dob"
                                required={true}
                                value={formData.dob}
                                onChange={handleChange}
                                />
                        </div>



                        <label>Gender</label>
                        <div className="multiple-input-container">
                            <input
                                id="man-gender-identity"
                                type="radio"
                                name="gender_identity"
                                value="man"
                                onChange={handleChange}
                                checked={formData.gender_identity === "man"}
                            />
                            <label htmlFor="man-gender-identity">Man</label>

                            <input
                                id="woman-gender-identity"
                                type="radio"
                                name="gender_identity"
                                value="woman"
                                onChange={handleChange}
                                checked={formData.gender_identity === "woman"}
                            />
                            <label htmlFor="woman-gender-identity">Woman</label>

                            <input
                                id="more-gender-identity"
                                type="radio"
                                name="gender_identity"
                                value="more"
                                onChange={handleChange}
                                checked={formData.gender_identity === "more"}
                            />
                            <label htmlFor="more-gender-identity">More</label>
                        </div>


                        <label htmlFor="show-gender">Show Gender on my Profile</label>

                        <input
                            id="show-gender"
                            type="checkbox"
                            name="show_gender"
                            onChange={handleChange}
                            checked={formData.show_gender}
                        />

                        <label>Show Me</label>

                        <div className="multiple-input-container">
                            <input
                                id="man-gender-interest"
                                type="radio"
                                name="gender_interest"
                                value="man"
                                onChange={handleChange}
                                checked={formData.gender_interest === "man"}
                            />
                            <label htmlFor="man-gender-interest">Man</label>
                            <input
                                id="woman-gender-interest"
                                type="radio"
                                name="gender_interest"
                                value="woman"
                                onChange={handleChange}
                                checked={formData.gender_interest === "woman"}
                            />
                            <label htmlFor="woman-gender-interest">Woman</label>
                            <input
                                id="everyone-gender-interest"
                                type="radio"
                                name="gender_interest"
                                value="everyone"
                                onChange={handleChange}
                                checked={formData.gender_interest === "everyone"}
                            />
                            <label htmlFor="everyone-gender-interest">Everyone</label>

                        </div>

                        <label htmlFor="about">About me</label>
                        <input
                            id="about"
                            type="text"
                            name="about"
                            required={true}
                            placeholder="I like long walks..."
                            value={formData.about}
                            onChange={handleChange}
                        />

                        <input type="submit"/>


                    </section>


                    <section>

                        <label htmlFor="url">Profile Photo</label>
                        <input
                            type="url"
                            name="url"
                            id="url"
                            onChange={handleChange}
                            required={true}
                            value={formData.url}
                        />
                        <div className="photo-container">
                            {formData.url && <img src={formData.url} alt="profile pic preview"/>}
                        </div>


                    </section>

                </form>

            </div>
        </>
    )
}
export default OnBoarding