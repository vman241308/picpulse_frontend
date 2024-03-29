import SignUpSide from "@/components/Auth/SignUp";
import backgroundImage from "@/assets/background.jpeg";
const SignUp = () => {
  return (
    <>
      <div
        className="w-full h-full bg-white text-black flex items-center justify-center"
        style={{
          backgroundImage: `url(${backgroundImage})`, // set image here
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <SignUpSide />
      </div>
    </>
  );
};

export default SignUp;
