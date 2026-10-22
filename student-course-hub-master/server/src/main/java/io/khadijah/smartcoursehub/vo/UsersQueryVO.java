package io.khadijah.smartcoursehub.vo;


import lombok.Data;

import java.io.Serializable;

@Data
public class UsersQueryVO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;

    private String name;

    private String email;

    private String password;

    private String role;

}
