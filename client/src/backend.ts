export default class BackendService
{
  constructor ( private urlBase:string ) {}

  private async get( endpoint:string ) 
  {
    const response = await fetch( this.urlBase + endpoint, { 
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