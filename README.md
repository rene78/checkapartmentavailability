# Check website for keyword
This script checks a website for certain keywords twice a day. If the keyword appears on the website an e-mail will be sent out to a predefined address. This Node.js script has been written to work on Microsofts Functions-as-a-Service (FaaS) offering, specifically [Azure Functions Timer Trigger](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-timer). Rewriting it for a vanilla Node.js backend shouldn't require much effort though. You could use a scheduler like ```node-cron``` to call your function at specific times.

# Configuration Variables
To customize the functionality, you may adjust the following private variables in a ```local.settings.json``` file:

- **"TARGET_URL":** Website to search on, e.g. `https://www.example.com`
- **"KEYWORDS_TO_FIND":** Array of keywords that are searched for on the website, e.g. `[\"keyword1\", \"keyword2\", \"keyword3\"]`
- **"SENDER_HOST":** Your email host, e.g. `smtp.office365.com`
- **"SENDER_USER_NAME":** Your email address, e.g. `john.doe@outlook.com`
- **"SENDER_PASSWORD":** Email password, e.g. `password123`
- **"SENDER_EMAIL":** Text that appears in the from field of the email, e.g. `'<john.doe@outlook.com>`
- **"RECIPIENT_EMAIL":** The email address to which the notification mail is sent, e.g. `max.mustermann@gmail.com`

Here is an example of such a ```local.settings.json``` file

```
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsFeatureFlags": "EnableWorkerIndexing",
    
    "TARGET_URL": "https://www.example.com",
    "KEYWORDS_TO_FIND": "[\"keyword1\", \"keyword2\", \"keyword3\"]",

    "SENDER_HOST": "smtp.office365.com",
    "SENDER_USER_NAME": "john.doe@outlook.com",
    "SENDER_PASSWORD": "password123"
    "SENDER_EMAIL": "john.doe@outlook.com",
    "RECIPIENT_EMAIL": "max.mustermann@gmail.com",
  }
}
```