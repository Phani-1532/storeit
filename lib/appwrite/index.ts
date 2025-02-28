"use server"

import { Account, Avatars, Client, Databases, Storage } from "appwrite";
import { appWriteConfig } from "@/lib/appwrite/config";
import { cookies } from "next/headers";


export const createSessionClient = async () => {
    const client = new Client()
        .setEndpoint(appWriteConfig.endPointUrl)
        .setProject(appWriteConfig.projectId);

    const session = (await cookies()).get("appwrite-session");
    console.log("Session Cookie:", session);

    if (!session || !session.value) throw new Error("No session");

    client.setSession(session.value);

    return {
        get account() {
            return new Account(client);
        },
        get database() {
            return new Databases(client);
        }
    };
};

// We have to create different sessions for client and admin
// If we create the same session for these two users, it will lead to security issues

export const createAdminClient = async () => {
    const client = new Client()
        .setEndpoint(appWriteConfig.endPointUrl)
        .setProject(appWriteConfig.projectId);

    // Instead of setting the key, you can use the API key directly in your requests
    // For example, if you need to perform an action that requires the key, you can do it like this:
       const apiKey = appWriteConfig.secretKey; // Ensure this is set correctly in your config

    return {
        get account() {
            return new Account(client);
        },
        get database() {
            return new Databases(client);
        },
        get storage() {
            return new Storage(client);
        },
        get avatars() {
            return new Avatars(client);
        }
    };
};