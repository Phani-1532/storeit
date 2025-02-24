"use server"

import { StringXor } from "next/dist/compiled/webpack/webpack";
import { createAdminClient } from "../appwrite";
import { appWriteConfig } from "../appwrite/config";
import { ID, Query } from "appwrite";
import { error } from "console";
import { parseStringify } from "../utils";
import path from "path";
import { cookies } from "next/headers";
import { avatarPlaceholderUrl } from "@/constants";

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

export const sendEmailOTP = async ({email} : {email:string}) => {
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
                avatar:avatarPlaceholderUrl,
                accountId,
            }
        )

    }

    return parseStringify({accountId})
}

export const verifySecret = async({accountId, password}: {accountId:string; password:string}) => {
    try{
        const {account} =  await createAdminClient()
        const session = await account.createSession(accountId, password);

        (await cookies()).set('appwrite-session', session.secret, {
            path:'/',
            httpOnly: true,
            sameSite : 'strict',
            secure:true
        })

        return parseStringify({sessionId : session.$id})

    }catch(error){
       handleError(error, "Failed to verify OTP") 
    }

}

export const getCurrentUser = async() => {}