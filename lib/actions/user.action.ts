"use server"

import { StringXor } from "next/dist/compiled/webpack/webpack";
import { createAdminClient } from "../appwrite";
import { appWriteConfig } from "../appwrite/config";
import { ID, Query } from "appwrite";
import { error } from "console";
import { parseStringify } from "../utils";

const getUserByEmail = async(email:string) => {
    const {database} = await createAdminClient()

    const result = await database.listDocuments(
        appWriteConfig.databaseId,
        appWriteConfig.usersCollectionId,
        [Query.equal("email", [email])],

    )

    return result.total > 0 ? result.documents[0] : null;
}

const handleError = (error:unknown, message : string) => {
    console.log(error)
    throw error
}

const sendEmailOTP = async ({email} : {email:string}) => {
    const {account} = await createAdminClient();
    
    try{
        const session = await account.createEmailToken(ID.unique(), email)

        return session.userId
    }catch(error){
        handleError(error, "Failed to send email OTP")
    }
}

 export const createAccount = async ({fullName, email} : {fullName:string; email:string}) => {
    const existingUser = await getUserByEmail(email)

    const accountId = await sendEmailOTP({email})

    if(!accountId) throw new Error("Failed to send an OTP")

    if(!existingUser){
        const {database} = await createAdminClient();

        await database.createDocument(
            appWriteConfig.databaseId,
            appWriteConfig.usersCollectionId,
            ID.unique(),
            {
                fullName,
                email,
                avatar:"",
                accountId,
            }
        )

    }

    return parseStringify({accountId})
}