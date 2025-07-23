
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Mail, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;

const EmailValidator = () => {
  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { toast } = useToast();

  const handleValidate = () => {
    const valid = emailRegex.test(email);
    setIsValid(valid);
    toast({
      title: valid ? "Valid Email" : "Invalid Email",
      description: valid
        ? "The email address is valid."
        : "Please enter a valid email address.",
      variant: valid ? "default" : "destructive",
    });
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-6 hover:border-cyan-500 transition-colors">
      <div className="flex items-center space-x-3 mb-4">
        <Mail className="h-6 w-6 text-cyan-400" />
        <h2 className="text-xl font-semibold text-gray-100">Email Validator</h2>
      </div>
      <div className="flex space-x-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter email address"
          className="flex-1 px-3 py-2 rounded border bg-gray-800 text-gray-100 border-gray-600 focus:outline-none"
        />
        <Button onClick={handleValidate} className="bg-cyan-500 hover:bg-cyan-600 text-white">
          Validate
        </Button>
      </div>
      {isValid !== null && (
        <div className="flex items-center space-x-2 mt-4">
          {isValid ? (
            <CheckCircle className="h-4 w-4 text-green-400" />
          ) : (
            <XCircle className="h-4 w-4 text-red-400" />
          )}
          <Badge variant={isValid ? "outline" : "destructive"}>
            {isValid ? "Valid Email" : "Invalid Email"}
          </Badge>
        </div>
      )}
    </Card>
  );
};

export default EmailValidator;
