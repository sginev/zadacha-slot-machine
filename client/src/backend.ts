const URL_BASE = "https://3000-f44035af-2256-4fb9-a8e3-4045fddf5dc6.ws-eu01.gitpod.io"

export default class BackendService
{
  private async get( endpoint:string ) 
  {
    const response = await fetch( URL_BASE + endpoint, { 
      headers: { 'Accept': 'application/json' },
      credentials: 'include',
    } )
    return await response.json()
  }

  async init() 
  {
    return await this.get( '/init' ) as {
      user : { spins : number , coins : number }
    }
  }

  async spin() 
  {
    return await this.get( '/spin' ) as {
      result : { 
        symbols : [ number, number, number ]
        reward : { coins : number }
      } , 
      user : { spins : number , coins : number }
    }
  }
}