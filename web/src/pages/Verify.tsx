import Submission from "../hooks/SubmitSteamID"
import Reqs from "../assets/requirement.png"
import DownReq from "../../public/requirement.jpeg"
import "./css/verify.css"

function Verify() {
    return (
        <div className="container">
            <h1>Welcome to Egg Sherran!</h1>
            <h3>Please change your Steam Profile to the provided image</h3>
            <a href={DownReq} download="required.jpeg">Click here to download the required Image</a>
            <img id="requirement" src={Reqs} alt="THis is not a loggo!" />
            <Submission />
        </div>
    )
}

export default Verify