import { config } from "../app/shared/utils/config"; 
import { Environment } from "./environment.model";

export const environment:Environment = {
    production: true,
    APIURL: config.API_URL,
    USER_POOL_ID: config.USER_POOL_ID,
}