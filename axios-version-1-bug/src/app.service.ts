import { Injectable } from '@nestjs/common';
import axios from "axios"
import fetchAdapter from "konfig-axios-fetch-adapter"

@Injectable()
export class AppService {
  getHello(): string {


    axios.create({
      adapter: fetchAdapter
    })

    return 'Welcome!';
  }
}
