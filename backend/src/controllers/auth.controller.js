import { registerUser, loginUser } from "../service/auth.service.js";

//register
export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);

    res.status(201).json({
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};


//login
export const login = async (req, res) => {
    try{
        const result = await loginUser(req.body);
        res.status(200).json({
            message: "Login successfully",
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};