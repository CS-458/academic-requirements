import { NextApiRequest, NextApiResponse } from "next";
import verifyToken from "../../services/login";

// TODO: this route isn't needed - any other route that requires
// authentication can just use the login service to check the token
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const id = await verifyToken(JSON.parse(req.body).token);
  if (id !== undefined) {
    res.status(200).json({});
  } else {
    res.status(401).json({
      error: "Token is not valid"
    });
  }
}
