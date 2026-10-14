import Submission from "../hooks/SubmitSteamID"
import Reqs from "../assets/requirement.png"
import "./css/verify.css"

function Verify() {
    return (
        <div className="container">
            <h1>Welcome to Egg Sherran!</h1>
            <h3>Please change your Steam Profile to the provided image</h3>
            <img id="requirement" src={Reqs} alt="THis is not a loggo!" />
            <Submission />
        </div>
    )
}

export default Verify