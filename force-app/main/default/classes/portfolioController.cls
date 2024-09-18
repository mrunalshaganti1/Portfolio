public with sharing class portfolioController {

    @AuraEnabled(cacheable = true)
    public static List<Portfolio__c> profileController(){
        List<Portfolio__c> portList = new List<Portfolio__c>();

        
        portList = [SELECT Id, Name, Brief_Text__c, About_Me__c, Candidate_Image__c, Contact_Number__c, Email__c, Github_Link__c, LinkedIn_Link__c, Copyrights__c
                    FROM Portfolio__c 
                    WHERE Name = 'Mrunal Shaganti'];

        return portList;
    }
    
    @AuraEnabled(cacheable = true)
    public static List<Expirence__c> expirenceController(){
        List<Expirence__c> expList = new List<Expirence__c>();

        expList = [SELECT Id, Name, Designation__c, Start_Date__c, End_Date__c, Location__c, Description__c, Portfolio_Profile__r.Name
                    FROM Expirence__c 
                    WHERE Portfolio_Profile__r.Name = 'Mrunal Shaganti'];

        return expList;
    }

    @AuraEnabled(cacheable = true)
    public static List<Education__c> educationController(){
        List<Education__c> eduList = new List<Education__c>();

        eduList = [SELECT Id, Name, University_Link__c, Logo_Field__c, Start_Date__c, End_Date__c, Degree_Type__c, Concentration__c, Revelant_Courses__c, Location__c, Portfolio_Profile__r.Name
                    FROM Education__c 
                    WHERE Portfolio_Profile__r.Name = 'Mrunal Shaganti'];

        return eduList;
    }
    
    @AuraEnabled(cacheable = true)
    public static List<Project__c> projectsController(){
        List<Project__c> proList = new List<Project__c>();

        proList = [SELECT Id, Name, Project_Link__c, Description__c, Technologies_Used__c, Portfolio_Profile__r.Name
                    FROM Project__c 
                    WHERE Portfolio_Profile__r.Name = 'Mrunal Shaganti'];

        return proList;
    }

    @AuraEnabled(cacheable = true)
    public static List<Certification__c> certificationsController(){
        List<Certification__c> cerList = new List<Certification__c>();

        cerList = [SELECT Id, Name, Certification_Link__c, Certification_Platform__c, Portfolio_Profile__r.Name, CreatedDate
                    FROM Certification__c 
                    WHERE Portfolio_Profile__r.Name = 'Mrunal Shaganti'];

        return cerList;
    }

    @AuraEnabled(cacheable = true)
    public static Map<Id, String> getResume(){
        Id profileId;
        List<Portfolio__c> portList = [SELECT Id FROM Portfolio__c WHERE Name = 'Mrunal Shaganti' LIMIT 1];
        if (!portList.isEmpty()) {
            profileId = portList[0].Id;
        }

        List<ContentDocumentLink> files = [SELECT ContentDocumentId
                                           FROM ContentDocumentLink
                                           WHERE LinkedEntityId =:profileId 
                                           ];
                            
        List<Id> fileIDs = new List<Id>();
        for (ContentDocumentLink docLink : files) {
            fileIDs.add(docLink.ContentDocumentId);
        }
     
        List<ContentVersion> docs = [SELECT ContentDocumentId, FileExtension, Title 
                                     FROM ContentVersion 
                                     WHERE ContentDocumentId 
                                     IN : fileIDs];
        Map<Id, String> mapIdTitle = new Map<Id, String>();
        for (ContentVersion docLink : docs) {
            mapIdTitle.put(docLink.ContentDocumentId, docLink.Title);
        }
        return mapIdTitle;
    }

    @AuraEnabled(cacheable = true)
    public static void sendEmail(String name, String email, String message) {
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        String[] toAddresses = new String[] {'mrunal.shaganti@gmail.com'}; // Enter your email address here
        mail.setToAddresses(toAddresses);
        mail.setSubject('New Contact Form Submission');
        String emailBody = 'Name: ' + name + '\n'
                         + 'Email: ' + email + '\n'
                         + 'Message: ' + message;
        mail.setPlainTextBody(emailBody);
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
    }

    @AuraEnabled
    public static Id createMessageRecord(String name, String email, String message){
        Portfolio_Messages__c portMessage = new Portfolio_Messages__c(Name = name,
        Sender_Email__c = email, 
        Sender_Mesage__c = message);
        try {
            insert portMessage;
            return portMessage.Id;
        } catch (Exception e) {
            System.debug(e);
        }
        return portMessage.Id;      
    }
}