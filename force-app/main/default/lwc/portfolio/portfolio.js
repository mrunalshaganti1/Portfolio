import { LightningElement, wire, track } from 'lwc';
import {NavigationMixin} from 'lightning/navigation'

import getProfile from '@salesforce/apex/portfolioController.profileController';
import expData from '@salesforce/apex/portfolioController.expirenceController';
import eduData from '@salesforce/apex/portfolioController.educationController';
import proData from '@salesforce/apex/portfolioController.projectsController';
import certiData from '@salesforce/apex/portfolioController.certificationsController';
import getResume from '@salesforce/apex/portfolioController.getResume';
import sendEmail from '@salesforce/apex/portfolioController.sendEmail';
import createMessageRecord from '@salesforce/apex/portfolioController.createMessageRecord';

import projectHero from '@salesforce/resourceUrl/Project_Hero';
import certificateHero from '@salesforce/resourceUrl/Certificate_Hero';
import courseraLogo from '@salesforce/resourceUrl/Coursera_Logo';
import BG_Image from '@salesforce/resourceUrl/BG_Image';
import aws_logo from '@salesforce/resourceUrl/AWS_Logo';
import default_Image from '@salesforce/resourceUrl/default_Image';



export default class Portfolio extends NavigationMixin(LightningElement) {
    
    @track experiences;

    @wire(getProfile)
    profile;

    @track profile_page = true;

    onProfileClick(){
        this.project_page = false;
        this.certificate_page = false;
        this.profile_page = true;
    }
    
    @wire(expData)
    wiredExperienceData({ error, data }) {
        if (data) {
            this.experiences = data.map(exp => ({
                ...exp,
                Description__c: this.processDescription(exp.Description__c)
            }));
        } else if (error) {
            this.experiences = undefined;
            console.error('Error retrieving experience data:', error);
        }
    }
    processDescription(description) {
        return description.split('•').map(point => point.trim()).filter(point => point !== '');
    }

    @wire(eduData)
    eduData;

    @track project_page = false;
    project_hero_url = projectHero;

    @wire(proData)
    proData;

    onProjectClick(){
        this.project_page = true;
        this.certificate_page = false;
        this.profile_page = false;
    }

    @track sortedData;
    error;

    @wire(certiData)
    wiredCertificates({ error, data }) {
        if (data) {
            this.sortedData = [...data].sort((a, b) => {
                // Assuming 'createdByDate' is in YYYY-MM-DD format or similar
                return new Date(b.CreatedDate) - new Date(a.CreatedDate);
            });
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.sortedData = undefined;
        }
    }

    @track certificate_page = false;
    certificate_Url = certificateHero;
    onCertificateClick(){
        this.certificate_page = true;
        this.project_page = false;
        this.profile_page = false;
    }

    @track imageUrl = default_Image; // Default image URL to start with

    // Mapping of platform names to their logos
    logoUrls = {
        'imageUrl' : default_Image,
        'Coursera': courseraLogo,
        'AWS': aws_logo
    };

    // Function to update image URL based on the platform
    updateImageUrl(platformName) {
        this.imageUrl = this.logoUrls[platformName] || default_Image;
    }

    renderedCallback() {
        // Assuming `certificateName` is obtained from a data attribute or passed as a property/api
        const certificateName = this.getCertificateName();
        this.updateImageUrl(certificateName);
    }

    getCertificateName() {
        // This is a placeholder. You might want to derive the name from component's data or attribute
        const certificateElement = this.template.querySelector('.certificateName');
        console.log("Getting Name: "+ certificateElement);
        if (certificateElement) {
            return certificateElement.textContent.trim().replace('-', '').trim();
        }
        return '';
    }

    @track isResumeModalOpen = false;
    openResumeModal(){
        this.isResumeModalOpen = true;
    }
    closeResumeModal(){
        this.isResumeModalOpen = false;
    }
    
    fileList =[];
    @wire(getResume)
    resumeFileDisplay({data,error}){
        if(data){
            this.fileList = Object.keys(data).map((item) => ({
                "label":data[item],
                "value": item,
                "url": `/sfc/servlet.shepherd/document/download/${item}`
            }));
        }
        if(error){
            alert(error);
        }
    }
    resumePreviewHandler(event){
        this[NavigationMixin.Navigate]({
            type: "standard__filePreview",
            state: {
                recordId: event.target.dataset.id,
                selectedRecordId: event.target.dataset.id,
            },
          });
    }

    mapMarkers = [
        {
            location: {
                City: 'Arlington',
                Country: 'USA',
                PostalCode: '22203',
                State: 'VA',
                Street: 'N Randolph St',
            },
            title: 'Arlington, VA',
            icon: 'standard:account',
        },
    ];

    // Contact Email Reciver
    @track name = '';
    @track email = '';
    @track message = '';

    handleNameChange(event) {
        this.name = event.target.value;
    }

    handleEmailChange(event) {
        this.email = event.target.value;
    }

    handleMessageChange(event) {
        this.message = event.target.value;
    }

    handleSubmit(event) {
        event.preventDefault();
        createMessageRecord({ name: this.name, email: this.email, message: this.message })
        .then(result => {
            console.log('Message received!!', result);
            return sendEmail({ name: this.name, email: this.email, message: this.message });
        })
        .then(result => {
            console.log('Email sent successfully', result);
            this.name = '';
            this.email = '';
            this.message = '';
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    @track bg_Image = BG_Image;

    get backgroundStyle() {
        return `background-image: url('${this.bg_Image}'); background-size: cover; background-position: center;`;
    }
}