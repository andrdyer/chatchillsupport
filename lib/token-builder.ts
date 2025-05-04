// This file handles token generation for Agora services

// Import the crypto module for token generation
import crypto from "crypto"

// Define role constants
export enum Role {
  PUBLISHER = 1,
  SUBSCRIBER = 2,
}

// Define privilege constants
export enum Privileges {
  JOIN_CHANNEL = 1,
  PUBLISH_AUDIO = 2,
  PUBLISH_VIDEO = 3,
  PUBLISH_DATA_STREAM = 4,
}

export class RtcTokenBuilder {
  /**
   * Builds a token with the specified parameters.
   * @param appId The App ID issued to you by Agora.
   * @param appCertificate The App Certificate issued to you by Agora.
   * @param channelName The channel name.
   * @param uid The user ID.
   * @param role The user role.
   * @param tokenExpireSeconds The token expiration time in seconds.
   * @param privilegeExpireSeconds The privilege expiration time in seconds.
   * @return The RTC token.
   */
  static buildTokenWithUid(
    appId: string,
    appCertificate: string,
    channelName: string,
    uid: number,
    role: Role,
    tokenExpireSeconds: number,
    privilegeExpireSeconds: number,
  ): string {
    return this.buildTokenWithUserAccount(
      appId,
      appCertificate,
      channelName,
      uid.toString(),
      role,
      tokenExpireSeconds,
      privilegeExpireSeconds,
    )
  }

  /**
   * Builds a token with the specified parameters.
   * @param appId The App ID issued to you by Agora.
   * @param appCertificate The App Certificate issued to you by Agora.
   * @param channelName The channel name.
   * @param account The user account.
   * @param role The user role.
   * @param tokenExpireSeconds The token expiration time in seconds.
   * @param privilegeExpireSeconds The privilege expiration time in seconds.
   * @return The RTC token.
   */
  static buildTokenWithUserAccount(
    appId: string,
    appCertificate: string,
    channelName: string,
    account: string,
    role: Role,
    tokenExpireSeconds: number,
    privilegeExpireSeconds: number,
  ): string {
    // Calculate the current timestamp in seconds
    const currentTimestamp = Math.floor(Date.now() / 1000)

    // Calculate the expiration timestamp
    const expireTimestamp = currentTimestamp + tokenExpireSeconds

    // Build the token content
    const tokenContent = {
      iss: appId, // issuer
      exp: expireTimestamp, // expiration time
      v: 1, // version
      channel: channelName,
      uid: account,
      role: role,
      privileges: {
        [Privileges.JOIN_CHANNEL]: currentTimestamp + privilegeExpireSeconds,
        [Privileges.PUBLISH_AUDIO]: currentTimestamp + privilegeExpireSeconds,
        [Privileges.PUBLISH_VIDEO]: currentTimestamp + privilegeExpireSeconds,
        [Privileges.PUBLISH_DATA_STREAM]: currentTimestamp + privilegeExpireSeconds,
      },
    }

    // Convert token content to string
    const tokenContentStr = JSON.stringify(tokenContent)

    // Create signature
    const signature = crypto.createHmac("sha256", appCertificate).update(tokenContentStr).digest("hex")

    // Combine signature and content
    const token = Buffer.from(signature + tokenContentStr).toString("base64")

    return token
  }

  /**
   * Builds a token with the specified uid and privileges.
   * @param appId The App ID issued to you by Agora.
   * @param appCertificate The App Certificate issued to you by Agora.
   * @param channelName The channel name.
   * @param uid The user ID.
   * @param tokenExpireSeconds The token expiration time in seconds.
   * @param joinChannelPrivilegeExpireSeconds The join channel privilege expiration time in seconds.
   * @param pubAudioPrivilegeExpireSeconds The publish audio privilege expiration time in seconds.
   * @param pubVideoPrivilegeExpireSeconds The publish video privilege expiration time in seconds.
   * @param pubDataStreamPrivilegeExpireSeconds The publish data stream privilege expiration time in seconds.
   * @return The RTC token.
   */
  static buildTokenWithUidAndPrivilege(
    appId: string,
    appCertificate: string,
    channelName: string,
    uid: number,
    tokenExpireSeconds: number,
    joinChannelPrivilegeExpireSeconds: number,
    pubAudioPrivilegeExpireSeconds: number,
    pubVideoPrivilegeExpireSeconds: number,
    pubDataStreamPrivilegeExpireSeconds: number,
  ): string {
    // Calculate the current timestamp in seconds
    const currentTimestamp = Math.floor(Date.now() / 1000)

    // Calculate the expiration timestamp
    const expireTimestamp = currentTimestamp + tokenExpireSeconds

    // Build the token content
    const tokenContent = {
      iss: appId, // issuer
      exp: expireTimestamp, // expiration time
      v: 1, // version
      channel: channelName,
      uid: uid.toString(),
      privileges: {
        [Privileges.JOIN_CHANNEL]: currentTimestamp + joinChannelPrivilegeExpireSeconds,
        [Privileges.PUBLISH_AUDIO]: currentTimestamp + pubAudioPrivilegeExpireSeconds,
        [Privileges.PUBLISH_VIDEO]: currentTimestamp + pubVideoPrivilegeExpireSeconds,
        [Privileges.PUBLISH_DATA_STREAM]: currentTimestamp + pubDataStreamPrivilegeExpireSeconds,
      },
    }

    // Convert token content to string
    const tokenContentStr = JSON.stringify(tokenContent)

    // Create signature
    const signature = crypto.createHmac("sha256", appCertificate).update(tokenContentStr).digest("hex")

    // Combine signature and content
    const token = Buffer.from(signature + tokenContentStr).toString("base64")

    return token
  }
}
