import SignInSide from "@/components/Auth/SignIn";
import backgroundImage from "@/assets/background.jpeg";

const SignIn = () => {
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
        <SignInSide />
      </div>
    </>
  );
};

export default SignIn;
