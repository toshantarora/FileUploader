import React,{useState,useEffect, useMemo} from 'react';
import  {useDropzone} from 'react-dropzone';
import Button from '@material-ui/core/Button';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import CloudUploadTwoToneIcon from '@material-ui/icons/CloudUploadTwoTone';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import RootRef from '@material-ui/core/RootRef';
import axios from 'axios';
// import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import {apiURL} from './apiURL';
import Swal from 'sweetalert2';
import swal from 'sweetalert'
import IconButton from '@material-ui/core/IconButton';


//css for material ui components
const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
        height:"auto",
        margin:'10px',    
    },
  }));

// css for Drag Box
const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: "rgb(102, 102, 102)",
    borderStyle: 'dashed',
    backgroundColor: '#c8dadf',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
  };
  
  const activeStyle = {
    borderColor: 'green'
  };
  
  const acceptStyle = {
    borderColor: '#00e676'
  };
  
  const rejectStyle = {
    borderColor: 'red'
  };

let allFiles = [];

const FileUpload = () => {

      const setDefaultTypes = () => {
        return [
            {checked: false, type: '.jpg'},
            {checked: false, type: '.jpeg'},
            {checked: false, type: '.png'},
            {checked: false, type: '.pdf'},
            {checked: false, type: '.gif'},
            {checked: false, type: '.svg'},
            {checked: false, type: '.mp4'},
            {checked: false, type: '.mp3'},
            {checked: false, type: '.doc'},
            {checked: false, type: '.docs'},
            {checked: false, type: '.csv'},
            {checked: false, type: '.zip'},
            {checked: false, type: '.ppt'},
            {checked: false, type: '.pptx'},
        ];
    }

    const classes = useStyles();
    const [fileTypes, setFileTypes] = useState(setDefaultTypes);
    const [draggedFiles, setDraggedFiles] = useState([]);
    const [progress, setProgress] = useState(false);
   
    const {
        getRootProps,
        getInputProps,
        open,
        isDragActive,
        isDragAccept,
        isDragReject,
        acceptedFiles,
        fileRejections,
    } = useDropzone({
       
        accept:fileTypes.filter(type => type.checked).length ? fileTypes.filter(type => type.checked).map(type => {return type.type}) : '', 
        noClick: true, 
        noKeyboard: true,
        onDrop: (acceptedFiles) => {
          console.log(acceptedFiles);
          setDraggedFiles(acceptedFiles.map(file => {
              allFiles.push(file);
              Object.assign(file, {
                  preview: URL.createObjectURL(file)
              })
          }));
      },
        onDropRejected: (fileRejections) => {
          if(fileRejections.length) {
            Swal.fire('Please select Selected File Type. ', {
              icon:'warning',
              closeOnClickOutside:false,
              CloseOnEsc:false,
            }).then(function(){
              open();
            })
          }

        } 
    });

   //Delete Button
    const onDelete = file => {
        console.log("delete")
        allFiles.splice(allFiles.indexOf(file), 1);
        setDraggedFiles([...allFiles]);
    
    }
    
    //Files 
    const files = allFiles.map((file,i) => 
        <li key={file.path}>
          {file.path} - {file.type} - {file.size} bytes
          <IconButton color="primary" aria-label="delete" onClick={() => onDelete(file)}>
            <HighlightOffIcon />
          </IconButton>
        </li>
      
    );


      useEffect(() => () => {
        // Make sure to revoke the data uris to avoid memory leaks
        draggedFiles.forEach(file => URL.revokeObjectURL(file));
      }, [files]);

    
    //upload Function
    const uploadFiles = () => {
        let formData = new FormData();
       
        setProgress(true);
        allFiles.forEach(file => {
           formData.append('file', file);
        })
        console.log("drr",acceptedFiles)
      axios.post(apiURL + '/upload/multifileupload', formData)
        .then(res => {
            console.log(res);
            if(res["data"].status === 200 ) {
                setProgress(false);
                swal({
                  title: "Files uploaded Successfully",
                  icon: "success",
                });
                // alert('Files uploaded succesfully!');
            }
            if(res["data"].status === 201) {
              setProgress(false);
              swal(res["data"].msg, {
                  icon: 'warning'
              });
          }       
        })
        .catch(err => {
            setProgress(false);
            swal({
              title: "net::ERR_FAILED!",
              text: "You clicked the button!",
              icon: "error",
            });

            if(!navigator.onLine){
              swal({
                title:"offline",
                text: "Check your internet Connection",
                icon: "warning"
              })
            }
            console.log(err);
        })
    }
    
    const style = useMemo(() => ({
        ...baseStyle,
        ...(isDragActive ? activeStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [
        isDragActive,
        isDragReject,
        isDragAccept
    ]);

    //checkbox functionality
    const getFileTypes = (checked, id) => {
      let arr = fileTypes;
      arr[id].checked = checked;
      setFileTypes([...arr]);
  }

  //Reset Button
      const Reset = () => {
     setFileTypes(setDefaultTypes);
  }
  const SelectAll = () => {
    let arr = fileTypes;
    arr.forEach(array => array.checked = true);
    setFileTypes([...arr]);
  }  
      
  const {ref, ...rootProps} = getRootProps();

    return (
            <RootRef rootRef={ref}>
              <div className={classes.root}>
                <Grid container >
                  <Grid item xs={12}>
                    <Paper className={classes.paper}  {...rootProps} >
                    <div className="container">
                       <div {...getRootProps({style})}>
                          <input {...getInputProps()} />
                          <CloudUploadTwoToneIcon color="primary" fontSize="large"/>
                            {
                                isDragActive ?
                                <p>Drop the files here ...</p> :
                                <p>Drag 'n' drop some files here, or click to select files</p>
                            }               
                            <Button
                            variant="contained"
                            color="primary"
                            onClick={() =>  open()} >
                            Choose
                            </Button>
                        </div>
                          <FormGroup row>
                              {fileTypes.map((type, index) => {
                                  return(
                                      <FormControlLabel key = {index}
                                          control={
                                              <Checkbox
                                                  checked={type.checked}
                                                  color="primary"
                                                  onChange={(evt) => getFileTypes(evt.target.checked, index)}
                                                  value={type.type}/>
                                          }
                                          label={type.type}
                                      />
                                  )
                              })}
                            <div style={{display:"flex", justifyContent:"space-around"}}>
                            <Button 
                              variant="contained" 
                              color="primary"
                              style={{marginRight: '20px'}} 
                              onClick={() => SelectAll()}
                          >
                              Select All
                          </Button>
                          <Button 
                              variant="contained" 
                              color="primary"
                              style={{marginLeft: 'auto'}} 
                              onClick={() => Reset()}
                          >
                              Reset
                          </Button>
                            </div>
                          </FormGroup>
                            <div>
                               <p>{files}</p>
                            </div>
                              {
                                 progress ? 
                                 <CircularProgress variant="indeterminate"/>
                                  : null
                              }
                            <Button 
                              onClick={uploadFiles} 
                              variant="contained" 
                              color="primary"
                              disabled={acceptedFiles.length === 0} 
                              startIcon={<CloudUploadIcon />}>
                              Upload
                              </Button>
                        </div>
 
                    </Paper> 
                   </Grid>
                </Grid>    
               </div>
            </RootRef>      
    )
}

export default FileUpload;
