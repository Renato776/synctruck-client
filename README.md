# 3rd party integration

In order to integrate our system with any 3rd party information source 
(aka any source outside ourselves and Google) there are 5 points/details
we must agree on. This is why talking/writting to someone in the 3rd 
party would be important, so we can negotiate and all of these.

However, if you'd like an example assuming we decide and set all of these points
and the 3rd party agrees, it would look like:


## Role definition
First things first, we must agree on what role each of us will be playing, 
this means agreeing on who is the client and who is the server. 

### We are the server - They are the client.
I think this is the best choice for both parties, as AWS would not need to 
worry about compromising their data or security as we would never attempt
any request directly to them, instead they would send the data directly to us.

### They are the server - We are the client.
This option might be difficult for them to accept, as it would require them
to provide us with credentials, endpoints and other sensitive information 
for us to authenticate with their servers and be able to retrieve the data.
Another disadvantage is that we would need to implement a polling-like 
algorithm for retrieving the data, as there'd be no way for us to know 
when a new piece of data is available. <br>

Since we are assuming we can decide everything, I'll choose the first one:
We are the server and they are the client. The next points would vary greatly 
depending on our role so all of those will be chosen based on this role distribution.

## Authentication

There are several different ways to authenticate over the internet. Each with 
their pros and cons. Some are easy to implement but relatively easy to "hack" 
others are way more secure but significantly difficult to implement.

You can investigate a few authentication methods like:

- Amazon Cognito
- JWT 
- Bearer
- API-KEY

There are way many more and you might want to get into a debate on whether 
Token Bearer should be counted as a stand alone authentication method, 
however the thing is there are many ways to authenticate and the party playing
the Server role gets to decide what to use. In this case, since we are the server 
we'll use a approach not listed above:<strong>Internal Keys</strong><br>
The term Internal Keys is not a widely use term, so don't talk about it with other
people like the term is known! There is no official term for referring to our method,
so that's why I decided to call it like that. Nevertheless, this method works as follows:

1. We generate a key (An encrypted String, usually 16 chars long using any encription algorithm)
2. We send this key to the client (In this case AWS)
3. We let them know that they must append this key in their request in order for them to authenticate with us.
4. If the key ever gets compromised, they can let us know for us to deactivate the key, generate a new one and send it to them.
5. This method would never expire keys.

This method is arguably less secure than most methods listed above, but is certainly better than nothing.
It is also relatively easy to implement for us and since this integration doesn't manage ultra important secure
information (Like bank transactions, Federal information, etc) I think it should be secure enough for our use case.

## Data Model

A Data Model is a way for people to express the structure of their data. There are 3 common formats used by 
most developers and even people in general who want a structured way of expressing data. Those are:

- Yaml: By far the most human-readable method. It has gained a lot of popularity lately for the same reason.
- JSON: By far the most popular and widely accepted as the HTTP standard. Not as human friendly as Yaml but is still relatively easy to understand.
- XML: The oldest and least used method. This method is almost forgotten but still finds some use in Java based tools.

All those 3 serve exactly the same purpose and therefore the same data can be represented in all three of them. 
Since Yaml is the most human friendly, I think we'll go with that for expressing our data model.
I am not sure what data you are planning to request, so this is just an example:

```yaml
sds:
  driver: string
  van: string
  route: string
  package_count: int
  ETA: timestamp
  began: timestamp
```

## Endpoint

Alright, next the endpoint. This gets decided by the server role, and 
indicates a URL endpoint to which you must send your request. Since they haven't agreed 
on the integration it'd be pointless to deploy the endpoint, however 
it should look something like:<br>

PUT - https://33g3fhgzt4.execute-api.us-east-2.amazonaws.com/Production/sds/{key} <br>

Where {key} is a URL parameter and must be substitued by the key sent to the client.
Usually, in the endpoint specification we also indicate the request body if applicable.
In this case, the request body is simply a JSON encoded instance of sds defined in the
previous step.

## Response

An HTTP request can return anything, however we must be very clear on what should
the client expect. This is also decided by the Server. In this case, the client
doesn't need to expect anything other than a success confirmation, therefore
in our escenario the possible responses are: 

```yaml
responses:
  - code: 201
    description: The response sent to the client if operation was successful.
    body: 
      success: true
  - code: 403
    description: An error message indicating that the provided key is not valid.
    body:
      message: string
```

Alright, that's all! All of these might change depending on whether they agree or not 
and they will vary greatly if they choose to play the Server role.
