import Submission from "../hooks/SubmitSteamID"
import Reqs from "../assets/requirement.png"

function Verify() {
    return (
        <>
            <h1>Welcome to Egg Sherran!</h1>
            <h3>Please change your Steam Profile to the provided image</h3>
            <img src={Reqs} alt="THis is not a loggo!" />
            <Submission />
        </>
    )
}

export default Verify