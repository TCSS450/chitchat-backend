




/*
ChangePassword
Status: Not Implemented
Constraint: only present to logged in users
Type: POST
EndPoint: https://group3-backend.herokuapp.com/password-change
Input: Requires JSON containing email of verified user
	Ex: {“user “myemail@mydomail.com”}  or  {“user”: “nickname”}
INPUT CONDITIONS:
User field in json 
Email or nickname is a verified user
Output Response: Returns a JSON object with status condition
Ex: {“status”: N} 
	N can be numbers {1, 2 }
		1- Successful password change
        2-  Incorrect Input to endpoint / any other error 
*/