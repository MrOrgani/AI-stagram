import { useState } from "react";

import { Card } from "@/components/ui/card";
import { cn, createOrGetUser } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { GoogleLogin } from "@react-oauth/google";
import { ImCross } from "react-icons/im";
import SignupForm from "../forms/SignupForm";
import { useUserContext } from "@/context/AuthContext";
import SigninForm from "../forms/SigninForm";

interface LoginModalProps {
  initialDisplay?: boolean;
  displayButton?: boolean;
  onClose?: () => void;
}

const LoginModal = ({
  initialDisplay = false,
  displayButton = true,
  onClose,
}: LoginModalProps) => {
  const { user, isLoading } = useUserContext();
  const [diplayModal, setDiplayModal] = useState(initialDisplay);

  const [mode, settMode] = useState<"signup" | "signin">("signup");

  if (user?.id) {
    return null;
  }

  return (
    <>
      {displayButton ? (
        <Button
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "flex justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6  shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          )}
          onClick={() => setDiplayModal(true)}>
          Sign in
        </Button>
      ) : null}

      {diplayModal ? (
        <div className="fixed inset-0 flex justify-center items-center">
          <div className="fixed inset-0 bg-black opacity-50 z-50" />
          <Card className="fixed flex flex-col items-center justify-center mx-auto my-auto z-50 p-10">
            <div className="flex flex-col space-y-2 text-center">
              <div
                className="absolute top-0 right-0 p-4 cursor-pointer"
                onClick={() => {
                  setDiplayModal(false);
                  if (onClose) {
                    onClose();
                  }
                }}>
                <ImCross />
              </div>
              <div className="flex justify-center">
                <span
                  className={`text-2xl ${
                    mode === "signin"
                      ? "font-semibold"
                      : "text-muted-foreground"
                  } tracking-tight`}
                  onClick={() => settMode("signin")}>
                  Sign in
                </span>
                <span className={`text-2xl font-semiboldtracking-tight mx-2`}>
                  |
                </span>
                <span
                  className={`text-2xl ${
                    mode === "signup"
                      ? "font-semibold"
                      : "text-muted-foreground"
                  } tracking-tight`}
                  onClick={() => settMode("signup")}>
                  Sign up
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter your email below to connect
              </p>
            </div>
            <div className={cn("grid gap-6")}>
              {mode === "signup" ? <SignupForm /> : <SigninForm />}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button variant="outline" type="button" disabled={isLoading}>
                {isLoading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.gitHub className="mr-2 h-4 w-4" />
                )}
                Github
              </Button>
              {user ? (
                <div>Logged In</div>
              ) : (
                <GoogleLogin
                  onSuccess={(response) => createOrGetUser(response)}
                />
              )}
              <p className="px-8 text-center text-sm text-muted-foreground">
                {mode === "signup" ? (
                  <>
                    Already have an account ?{" "}
                    <span
                      onClick={() => settMode("signin")}
                      className="underline">
                      Sign in!
                    </span>
                  </>
                ) : (
                  <>
                    No account ?{" "}
                    <span
                      onClick={() => settMode("signup")}
                      className="underline">
                      Sign up!
                    </span>
                  </>
                )}
              </p>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
};

export default LoginModal;
