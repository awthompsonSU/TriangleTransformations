//Andrew Thompson
//bafflesTest.java
//This file sets up our game board and actually runs the game
import javax.swing.JOptionPane;
import java.awt.Graphics;
import javax.swing.JPanel;
import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import javax.swing.JFrame;

//this class runs the program
public class bafflesTest
{        
    public static void main(String args[])
    {   //set up the variable that holds the baffles
        baffleExtension baffle = new baffleExtension();
        baffle.findDifficulty();
        baffle.createShape();
        baffle.transformShape();
        if (baffle.getDifficulty()==2)
            baffle.transformShape();
        //set up the JFrame and Container to hold the baffles grid and the GamePlayOptions
        JFrame application = new JFrame();
        application.setTitle("TRANSFORMATIONS!!");
        application.setSize(900,800);
        Container c=application.getContentPane();
        application.setResizable(false);
        JPanel panel_label=new JPanel();
        
        //Set up the GamePlayOptions label
        GamePlayOptions label = new GamePlayOptions(baffle);
        label.setMaximumSize(new Dimension(300,200));
        panel_label.add(label);
        panel_label.setSize(200,300);
        
        c.setLayout(new BorderLayout());
                
        application.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        
        c.add(panel_label,BorderLayout.LINE_END);
        c.add(baffle,BorderLayout.CENTER);
                
        //MenuBar menu=new MenuBar(baffle, application);
        //application.setJMenuBar(menu);
       
       //Set the game panel to visible  
        application.setVisible(true);        
     }
}