import pool from "../../database/connection";
import { ApiError } from "../../errors/ApiError";
import { ICGetPunctuationInSchema } from "../../schemas/lojinha/input/getPunctuationIn.schema";
import { ICGetPunctuationOutSchema } from "../../schemas/lojinha/output/getPunctuationOut.schema";

export const getPunctuationData = async(userId: number): Promise<void> => {


}