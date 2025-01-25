import { config } from "../app/shared/utils/config"; 
import { Environment } from "./environment.model";

export const environment:Environment = {
    production: false,
    APIURL: config.API_URL
}