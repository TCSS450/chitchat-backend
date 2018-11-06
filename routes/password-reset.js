


/*
ResetPassword  (forgot password)
Status: Not Implemented
Type: POST
EndPoint: https://group3-backend.herokuapp.com/password-reset
Input: Requires JSON containing email and password
	Ex: {“user”: “myemail@mydomail.com”} or  {“user”: “nickname”}
INPUT CONDITIONS:
User field in json 	
Sends an email to user email address with verification pin
Output Response: Returns a JSON object with status condition
Ex: {“status”: N} 
	N can be numbers {1, 2, 3, 4}
		1- Successful email sent (load LoginForgotPassVerificationFrag -use verify
      endpoint to verify number entered)
		2- User doesn’t exist in DB
3- User exists but user is not verified
		4-  Incorrect Input to endpoint / any other error 
*/